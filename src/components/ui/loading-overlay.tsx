import PageLoader from "./page-loader";

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

const LoadingOverlay = ({
  isLoading,
  message = "Loading...",
}: LoadingOverlayProps) => {
  if (!isLoading) return null;

  return (
    <div
      className="fixed inset-0 w-full h-full flex items-center justify-center z-[9999] transition-all duration-500"
      style={{
        backgroundColor: "rgba(17, 24, 39, 0.60)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        className="flex flex-col items-center bg-gradient-to-b from-white/98 to-white/95 px-8 py-6 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] transform transition-all duration-500 animate-fadeIn backdrop-blur-sm border border-white/20"
        style={{
          animation: "fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="relative bg-white/40 p-3 rounded-xl shadow-inner">
          <PageLoader isOutlined={true} />
        </div>
        <div className="mt-5 flex flex-col items-center gap-1">
          <span className="text-gray-900 font-semibold text-base tracking-wide leading-none">
            {message}
          </span>
          <span className="text-gray-500 text-sm">Please wait...</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
