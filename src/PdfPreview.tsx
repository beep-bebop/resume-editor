import { useEffect, useRef, useState } from "react";
import { getDocument, type PDFDocumentProxy, type PDFPageProxy } from "pdfjs-dist/legacy/build/pdf.mjs";

type LoadedPreview = { blob: Blob; document: PDFDocumentProxy; pages: PDFPageProxy[] };

function PdfPage({ page, zoom }: { page: PDFPageProxy; zoom: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const viewport = page.getViewport({ scale: zoom * 1.18 });
    const ratio = window.devicePixelRatio || 1;
    const context = canvas.getContext("2d");
    if (!context) return;
    canvas.width = Math.round(viewport.width * ratio);
    canvas.height = Math.round(viewport.height * ratio);
    canvas.style.width = Math.round(viewport.width) + "px";
    canvas.style.height = Math.round(viewport.height) + "px";
    const renderTask = page.render({
      canvas, canvasContext: context,
      viewport: page.getViewport({ scale: zoom * 1.18 * ratio }),
    });
    void renderTask.promise.catch((error) => {
      if (error?.name !== "RenderingCancelledException") console.error(error);
    });
    return () => renderTask.cancel();
  }, [page, zoom]);
  return <canvas ref={canvasRef} className="pdf-page" aria-label="PDF 页面预览" />;
}

export default function PdfPreview({ blob, zoom }: { blob: Blob | null; zoom: number }) {
  const [loaded, setLoaded] = useState<LoadedPreview | null>(null);
  useEffect(() => {
    if (!blob) { setLoaded(null); return; }
    let disposed = false;
    let document: PDFDocumentProxy | null = null;
    void (async () => {
      const task = getDocument({ data: await blob.arrayBuffer() });
      document = await task.promise;
      if (disposed) { await document.destroy(); return; }
      const pages = await Promise.all(
        Array.from({ length: document.numPages }, (_, index) => document!.getPage(index + 1)),
      );
      if (!disposed) setLoaded({ blob, document, pages });
    })().catch(console.error);
    return () => {
      disposed = true;
      if (document) void document.destroy();
    };
  }, [blob]);
  if (!blob) return <div className="preview-empty">选择简历后，这里会显示生成的 PDF。</div>;
  const current = loaded && loaded.blob === blob ? loaded : null;
  return (
    <div className="pdf-stack" aria-label="PDF 预览">
      {current && current.pages.length ? current.pages.map((page, index) => (
        <div className="pdf-page-wrap" key={index}>
          <PdfPage page={page} zoom={zoom} />
          <span>第 {index + 1} / {current.document.numPages} 页</span>
        </div>
      )) : <div className="preview-empty">正在绘制 PDF 页面…</div>}
    </div>
  );
}