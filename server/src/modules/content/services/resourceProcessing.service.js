import { ContentResource } from '../models/contentResource.model.js';
import { ResourceVersion } from '../models/resourceVersion.model.js';
import { ContentChunk } from '../models/contentChunk.model.js';
import { ResourceProcessingJob } from '../models/resourceProcessingJob.model.js';
import { TextExtractionService } from './textExtraction.service.js';
import { TextCleaningService } from './textCleaning.service.js';
import { TextChunkingService } from './textChunking.service.js';
import { EmbeddingService } from './embedding.service.js';
import { logger } from '../../../utils/logger.js';

export class ResourceProcessingService {
  /**
   * Run the full RAG pipeline on a resource version.
   */
  static async processResourceVersion({ resourceId, versionId, fileBuffer }) {
    logger.info(`🔄 Starting RAG pipeline for resource: ${resourceId}, version: ${versionId}`);

    const resource = await ContentResource.findById(resourceId);
    const version = await ResourceVersion.findById(versionId);

    if (!resource || !version) {
      throw new Error('Resource or version not found for processing');
    }

    // 1. Create/Update processing job
    let job = await ResourceProcessingJob.findOne({ resourceVersionId: versionId });
    if (!job) {
      job = await ResourceProcessingJob.create({
        resourceId,
        resourceVersionId: versionId,
        classroomId: resource.classroomId,
        jobType: 'full_rag_pipeline',
        status: 'processing',
        startedAt: new Date(),
      });
    } else {
      job.status = 'processing';
      job.attempts += 1;
      job.startedAt = new Date();
      await job.save();
    }

    await ContentResource.findByIdAndUpdate(resourceId, {
      processingStatus: 'running',
      indexingStatus: 'indexing',
    });

    try {
      // Step 1: Extraction
      const extraction = await TextExtractionService.extractText({
        sourceType: version.sourceType,
        buffer: fileBuffer,
        textContent: version.textContent,
        externalUrl: resource.externalUrl,
        description: resource.description,
      });

      version.textContent = extraction.text;
      version.extractionMetadata = {
        pageCount: extraction.pageCount,
        characterCount: extraction.characterCount,
        wordCount: extraction.wordCount,
        warnings: extraction.warnings,
      };
      await version.save();

      job.progressPercentage = 25;
      await job.save();

      // Step 2: Text Cleaning
      const cleaned = TextCleaningService.cleanText(extraction.text);
      job.progressPercentage = 40;
      await job.save();

      // Step 3: Chunking
      const chunkSpecs = TextChunkingService.chunkText(cleaned.cleanedText, {
        topic: resource.topic,
        unit: resource.unit,
      });

      // Deactivate older chunks for this version if any
      await ContentChunk.updateMany({ resourceVersionId: versionId }, { $set: { isActive: false } });

      job.progressPercentage = 60;
      await job.save();

      // Step 4: Embedding Generation
      const createdChunks = [];
      for (let i = 0; i < chunkSpecs.length; i++) {
        const spec = chunkSpecs[i];
        const embeddingVector = await EmbeddingService.generateEmbedding(spec.text);

        const chunkDoc = await ContentChunk.create({
          resourceId,
          resourceVersionId: versionId,
          classroomId: resource.classroomId,
          moduleId: resource.moduleId,
          teacherId: resource.teacherId,
          chunkIndex: spec.chunkIndex,
          text: spec.text,
          normalizedText: spec.normalizedText,
          embedding: embeddingVector,
          embeddingModel: 'text-embedding-004',
          embeddingDimension: embeddingVector.length,
          tokenEstimate: spec.tokenEstimate,
          characterCount: spec.characterCount,
          pageNumber: spec.pageNumber,
          sectionTitle: spec.sectionTitle,
          topic: resource.topic,
          unit: resource.unit,
          checksum: spec.checksum,
          isActive: true,
        });

        createdChunks.push(chunkDoc);
      }

      job.progressPercentage = 90;
      await job.save();

      // Step 5: Finalize Ready & Indexed State
      version.processingStatus = 'completed';
      version.isCurrent = true;
      await version.save();

      // Deactivate chunks from previous versions
      await ContentChunk.updateMany(
        { resourceId, resourceVersionId: { $ne: versionId } },
        { $set: { isActive: false } }
      );

      await ContentResource.findByIdAndUpdate(resourceId, {
        currentVersionId: versionId,
        processingStatus: 'completed',
        indexingStatus: 'indexed',
        status: resource.status === 'draft' || resource.status === 'uploaded' ? 'ready' : resource.status,
        totalChunks: createdChunks.length,
        characterCount: cleaned.characterCount,
        wordCount: cleaned.wordCount,
        estimatedReadingMinutes: Math.max(1, Math.ceil(cleaned.wordCount / 200)),
      });

      job.status = 'completed';
      job.progressPercentage = 100;
      job.completedAt = new Date();
      await job.save();

      logger.info(`✅ Resource ${resourceId} processed successfully into ${createdChunks.length} chunks`);
      return { success: true, totalChunks: createdChunks.length };
    } catch (err) {
      logger.error(`💥 Processing failed for resource ${resourceId}:`, { error: err.message });

      job.status = 'failed';
      job.lastErrorMessage = err.message;
      job.failedAt = new Date();
      await job.save();

      await ContentResource.findByIdAndUpdate(resourceId, {
        processingStatus: 'failed',
        indexingStatus: 'failed',
        status: 'failed',
        processingErrorMessage: err.message,
      });

      throw err;
    }
  }
}
