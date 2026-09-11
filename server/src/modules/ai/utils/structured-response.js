export const formatGroundedResponse = ({
  answer,
  citations = [],
  grounded = true,
  confidence = 'high',
  suggestedFollowups = [],
}) => {
  return {
    answer,
    citations,
    grounded,
    confidence,
    suggestedFollowups,
  };
};
