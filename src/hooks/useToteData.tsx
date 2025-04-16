
import { useInboundTotes } from './useInboundTotes';
import { useStagedTotes } from './useStagedTotes';
import { useOutboundTotes } from './useOutboundTotes';

export const useToteData = () => {
  const { inboundTotes, isLoading: isLoadingInbound, error: inboundError } = useInboundTotes();
  const { stagedTotes, isLoading: isLoadingStaged, error: stagedError } = useStagedTotes();
  const { outboundTotes, isLoading: isLoadingOutbound, error: outboundError } = useOutboundTotes();
  
  // Combine loading states
  const isLoadingTotes = isLoadingInbound || isLoadingStaged || isLoadingOutbound;
  
  // Combine error states
  const error = inboundError || stagedError || outboundError;

  return {
    inboundTotes,
    stagedTotes,
    outboundTotes,
    isLoadingTotes,
    error
  };
};
