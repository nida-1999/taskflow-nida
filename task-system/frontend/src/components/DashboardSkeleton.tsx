import Skeleton from "./ui/Skeleton";
import { useMobile } from "../hooks/useMobile";

const DashboardSkeleton = () => {
  const isMobile = useMobile();
  return (
    <div className="animate-fade-in flex flex-col gap-6 w-full">
      <header style={{ marginBottom: 40 }}>
        <Skeleton width={250} height={36} className="!mb-2" />
        <Skeleton width={300} height={20} />
      </header>
      <div className={isMobile ? "flex flex-col gap-6" : "bento-grid"}>
        {/* Today's Focus */}
        <div className="card bento-focus" style={{ padding: 32, display: "flex", flexDirection: "column" }}>
            <Skeleton width={100} height={14} className="!mb-3" />
            <Skeleton width={180} height={28} className="!mb-6" />
            <div className="flex flex-col gap-4 flex-1">
                <Skeleton width="80%" height={24} />
                <Skeleton width="60%" height={24} />
                <Skeleton width="70%" height={24} />
            </div>
            <div className="!pt-8 mt-auto">
                <div className="flex justify-between !mb-2">
                    <Skeleton width={60} height={14} />
                    <Skeleton width={30} height={14} />
                </div>
                <Skeleton width="100%" height={6} borderRadius={999} />
            </div>
        </div>
        
        {/* Upcoming */}
        <div className={`card !p-6 ${isMobile ? "!mt-0" : ""}`}>
            <Skeleton width={80} height={14} className="!mb-4 block" />
            <div className="flex flex-col gap-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="flex justify-between items-center">
                        <div className="flex gap-2 items-center w-2/3">
                            <Skeleton width={8} height={8} circle />
                            <Skeleton width="100%" height={16} />
                        </div>
                        <Skeleton width={40} height={16} borderRadius={4} />
                    </div>
                ))}
            </div>
            <Skeleton width="100%" height={36} borderRadius={8} className="!mt-6" />
        </div>

        {/* Overall Completion */}
        <div className="card !p-6 flex flex-col justify-center items-center">
             <Skeleton width={40} height={40} className="!mb-2" />
             <Skeleton width={80} height={32} className="!mb-1" />
             <Skeleton width={120} height={14} />
        </div>

        {/* Recent Projects */}
        <div className="card !p-6" style={{ gridColumn: "span 3"}}>
            <div className="flex justify-between items-center !mb-5">
                <Skeleton width={120} height={14} />
                <Skeleton width={80} height={28} borderRadius={8} />
            </div>
            <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-3"} gap-4`}>
                {[1, 2, 3].map(i => (
                    <div key={i} className="border border-[var(--border)] rounded-xl !p-4">
                        <Skeleton width="60%" height={20} className="!mb-3" />
                        <Skeleton width="100%" height={4} borderRadius={999} />
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardSkeleton;
