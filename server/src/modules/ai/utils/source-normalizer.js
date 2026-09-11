export const normalizeSourceMetadata = (chunk = {}) => {
  return {
    resourceId: chunk.resourceId?._id || chunk.resourceId,
    resourceTitle: chunk.resourceId?.title || chunk.sectionTitle || 'Classroom Notes',
    pageNumber: chunk.pageNumber || 1,
    sectionTitle: chunk.sectionTitle || 'General Section',
    chunkId: chunk._id,
    excerpt: chunk.text ? chunk.text.slice(0, 150) + '...' : '',
  };
};
