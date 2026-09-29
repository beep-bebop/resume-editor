import { useEffect, useRef, useState } from "react";
import { getDocument, type PDFDocumentProxy, type PDFPageProxy } from "pdfjs-dist";

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
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null);
  const [pages, setPages] = useState<PDFPageProxy[]>([]);
  useEffect(() => {
    if (!blob) return;
    let disposed = false;
    let loaded: PDFDocumentProxy | null = null;
    setPages([]);
    void (async () => {
      const task = getDocument({ data: await blob.arrayBuffer() });
      loaded = await task.promise;
      if (disposed) { await loaded.destroy(); return; }
      const nextPages = await Promise.all(
        Array.from({ length: loaded.numPages }, (_, index) => loaded!.getPage(index + 1)),
      );
      if (!disposed) {
        setDocument(loaded);
        setPages(nextPages);
      }
    })().catch(console.error);
    return () => {
      disposed = true;
      if (loaded) void loaded.destroy();
    };
  }, [blob]);
  if (!blob) return <div className="preview-empty">选择简历后，这里会显示生成的 PDF。</div>;
  return (
    <div className="pdf-stack" aria-label="PDF 预览">
      {pages.length ? pages.map((page, index) => (
        <div className="pdf-page-wrap" key={index}>
          <PdfPage page={page} zoom={zoom} />
          <span>第 {index + 1} / {document?.numPages} 页</span>
        </div>
      )) : <div className="preview-empty">正在绘制 PDF 页面…</div>}
    </div>
  );
}
