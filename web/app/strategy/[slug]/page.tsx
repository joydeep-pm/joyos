import { StrategyDocumentViewer } from "@/components/strategy/StrategyDocumentViewer";
import { getStrategyWorkspace } from "@/lib/strategy";

export default async function StrategyDocumentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const workspace = await getStrategyWorkspace();
  const allDocs = [
    ...(workspace.currentShareableStatus ? [workspace.currentShareableStatus] : []),
    ...workspace.businessStatusUpdates,
    ...workspace.roadmapUpdates,
    ...workspace.executiveSnapshots,
    ...workspace.boardSummaries,
    ...workspace.keyStrategyNotes,
    ...workspace.decisionSupport,
    ...workspace.indexes,
    ...workspace.templates
  ];

  const uniqueDocs = Array.from(new Map(allDocs.map((doc) => [doc.slug, doc])).values());
  const orderedDocs = uniqueDocs.sort((a, b) => (a.slug === slug ? -1 : b.slug === slug ? 1 : a.title.localeCompare(b.title)));

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate">Strategy document</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Readable strategy notes and outputs from the frontend</h2>
      </div>
      <StrategyDocumentViewer documents={orderedDocs} />
    </section>
  );
}
