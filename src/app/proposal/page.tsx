import { Suspense } from "react";
import ProposalClient from "@/components/proposal/ProposalClient";
import { Skeleton } from "@/components/ui/skeleton";

function ProposalFallback(): React.ReactElement {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 gap-6">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}

export default function ProposalPage(): React.ReactElement {
  return (
    <Suspense fallback={<ProposalFallback />}>
      <ProposalClient />
    </Suspense>
  );
}
