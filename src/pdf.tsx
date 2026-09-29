import React from "react";
import { Circle, Document, Font, Image, Line as SvgLine, Page, Polygon, Svg, Text, View, pdf } from "@react-pdf/renderer";
import { PDFDocument as PdfLibDocument } from "pdf-lib";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { mmToPt, parseResume, type FontWeight, type Line, type Resume, type Settings } from "./model";

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
const baseUrl = window.location.origin + import.meta.env.BASE_URL;
Font.register({
  family: "Noto Sans SC",
  fonts: ([300, 400, 600, 800] as const).map((fontWeight) => ({
    src: baseUrl + "fonts/NotoSansSC-" + fontWeight + ".ttf", fontWeight,
  })),
});
Font.register({
  family: "Noto Serif SC",
  fonts: ([300, 400, 600, 800] as const).map((fontWeight) => ({
    src: baseUrl + "fonts/NotoSerifSC-" + fontWeight + ".ttf", fontWeight,
  })),
});
Font.registerHyphenationCallback((word) =>
  word.match(/[\u3400-\u9fff\u3000-\u303f\uff00-\uffef]|[^\u3400-\u9fff\u3000-\u303f\uff00-\uffef]+/g) || [word],
);

function richText(source: string, settings: Settings, baseWeight: FontWeight) {
  const strongWeight = ([300, 400, 600, 800] as FontWeight[]).find((weight) => weight > baseWeight) || 800;
  return source.split(/(\*\*.*?\*\*|\x60.*?\x60)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <Text key={index} style={{ fontWeight: strongWeight, color: baseWeight === 800 ? settings.accentColor : undefined }}>{part.slice(2, -2)}</Text>;
    }
    if (part.startsWith("\x60") && part.endsWith("\x60")) {
      return <Text key={index} style={{ color: settings.accentColor }}>{part.slice(1, -1)}</Text>;
    }
    return <Text key={index}>{part}</Text>;
  });
}

function PdfLine({ line, settings }: { line: Line; settings: Settings }) {
  if (line.kind === "table") {
    return <View style={{ marginVertical: settings.itemGap + 3, borderTopWidth: .6, borderLeftWidth: .6, borderColor: settings.dividerColor }}>
      {(line.rows || []).map((row, rowIndex) => (
        <View key={rowIndex} wrap={false} style={{ flexDirection: "row", backgroundColor: rowIndex === 0 ? "#f5f2ed" : "#fff" }}>
          {row.map((cell, cellIndex) => (
            <Text key={cellIndex} style={{
              flex: 1, padding: 5, fontSize: settings.fontSize * .85, lineHeight: 1.3,
              fontWeight: rowIndex === 0 ? settings.entryFontWeight : settings.bodyFontWeight,
              borderRightWidth: .6, borderBottomWidth: .6, borderColor: settings.dividerColor,
            }}>{richText(cell, settings, rowIndex === 0 ? settings.entryFontWeight : settings.bodyFontWeight)}</Text>
          ))}
        </View>
      ))}
    </View>;
  }
  if (line.kind === "chart") {
    const rows = (line.rows || []).map(([label, raw]) => ({ label, value: Number(raw) }))
      .filter((row) => Number.isFinite(row.value) && row.value >= 0);
    const max = Math.max(1, ...rows.map((row) => row.value));
    return <View wrap={false} style={{ marginVertical: settings.itemGap + 4, gap: 6 }}>
      {rows.map((row, index) => (
        <View key={index} style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
          <Text style={{ width: 85, fontSize: settings.fontSize * .85, fontWeight: settings.bodyFontWeight }}>{row.label}</Text>
          <View style={{ flex: 1, height: 11, backgroundColor: "#f1eee9" }}>
            <View style={{ width: String(row.value / max * 100) + "%", height: 11, backgroundColor: settings.accentColor }} />
          </View>
          <Text style={{ width: 38, textAlign: "right", fontSize: settings.fontSize * .85, fontWeight: settings.bodyFontWeight }}>{String(row.value)}</Text>
        </View>
      ))}
    </View>;
  }
  const isTitle = line.kind === "entry" || line.kind === "project";
  const size = settings.fontSize * (line.kind === "entry" ? 1.04 : 1);
  const marginTop = isTitle ? settings.itemGap + 4 : 0;
  const marginBottom = line.kind === "bullet" ? settings.itemGap : 2;
  const color = line.kind === "project" ? settings.accentColor : settings.textColor;
  const bulletSize = settings.bulletSize;
  const weight = isTitle ? settings.entryFontWeight : settings.bodyFontWeight;
  return (
    <View wrap={line.kind !== "entry"} style={{
      flexDirection: "row", marginTop, marginBottom,
      marginLeft: line.kind === "bullet" ? settings.bulletIndent : 0,
      paddingLeft: line.kind === "project" ? 6 : 0,
      borderLeftWidth: line.kind === "project" ? 2 : 0,
      borderLeftColor: settings.accentColor,
    }}>
      {line.kind === "bullet" && (
        <View style={{ width: size * 1.3, paddingTop: Math.max(1, size * .38) }}>
          <Svg width={bulletSize} height={bulletSize}>
            {settings.bulletStyle === "diamond"
              ? <Polygon points={"0," + bulletSize / 2 + " " + bulletSize / 2 + ",0 " + bulletSize + "," + bulletSize / 2 + " " + bulletSize / 2 + "," + bulletSize} fill={settings.accentColor} />
              : settings.bulletStyle === "dot"
                ? <Circle cx={bulletSize / 2} cy={bulletSize / 2} r={bulletSize / 2} fill={settings.accentColor} />
                : <SvgLine x1={0} y1={bulletSize / 2} x2={bulletSize} y2={bulletSize / 2} stroke={settings.accentColor} strokeWidth={settings.bulletStroke} />}
          </Svg>
        </View>
      )}
      <Text style={{
        flex: 1, fontSize: size, lineHeight: settings.lineHeight,
        color, fontWeight: weight,
        fontFamily: isTitle ? (settings.headingFontFamily === "serif" ? "Noto Serif SC" : "Noto Sans SC") : undefined,
      }}>{richText(line.text, settings, weight)}</Text>
    </View>
  );
}

function ResumePdf({ resume, pageHeightMm }: { resume: Resume; pageHeightMm: number }) {
  const settings = resume.settings;
  const content = parseResume(resume.markdown);
  const contact = content.sections.find((section) => section.info);
  const mainSections = content.sections.filter((section) => !section.info);
  const width = mmToPt(settings.widthMm);
  const height = mmToPt(pageHeightMm);
  const margin = mmToPt(settings.marginMm);
  const photo = settings.photo || "";
  return (
    <Document title={content.name + "｜简历"} author="Resume Studio">
      <Page size={[width, height]} wrap={settings.mode === "paged"} style={{
        fontFamily: settings.fontFamily === "serif" ? "Noto Serif SC" : "Noto Sans SC",
        paddingTop: margin, paddingBottom: margin + (settings.mode === "paged" ? 12 : 0),
        paddingHorizontal: margin, color: settings.textColor, backgroundColor: "#ffffff",
      }}>
        <View wrap={false} style={{
          flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between",
          borderBottomColor: settings.accentColor, borderBottomWidth: 1.5,
          paddingBottom: 9, marginBottom: settings.sectionGap,
        }}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={{
              fontSize: settings.nameFontSize, lineHeight: 1.1, color: settings.accentColor,
              fontWeight: settings.nameFontWeight, marginBottom: 7,
              fontFamily: settings.headingFontFamily === "serif" ? "Noto Serif SC" : "Noto Sans SC",
            }}>
              {content.name}
            </Text>
            {(contact?.lines || content.preamble.map((text): Line => ({ kind: "paragraph", text }))).map((line, index) => (
              <PdfLine key={index} line={line} settings={{ ...settings, fontSize: settings.fontSize * .88 }} />
            ))}
          </View>
          {settings.showPhoto && photo && <Image src={photo} style={{ width: mmToPt(24), height: mmToPt(31), objectFit: "cover" }} />}
        </View>
        {mainSections.map((section, index) => (
          <View key={index} style={{ marginTop: index ? settings.sectionGap : 0 }}>
            <Text minPresenceAhead={settings.fontSize * 4} style={{
              fontSize: settings.sectionFontSize, lineHeight: 1.3, fontWeight: settings.sectionFontWeight,
              fontFamily: settings.headingFontFamily === "serif" ? "Noto Serif SC" : "Noto Sans SC",
              color: settings.accentColor, borderBottomColor: settings.dividerColor,
              borderBottomWidth: settings.dividerWidth, paddingBottom: 4, marginBottom: 5,
            }}>{section.title}</Text>
            {section.lines.map((line, lineIndex) => <PdfLine key={lineIndex} line={line} settings={settings} />)}
          </View>
        ))}
        {settings.mode === "paged" && (
          <Text fixed render={({ pageNumber, totalPages }) => pageNumber + " / " + totalPages}
            style={{ position: "absolute", bottom: margin * .45, right: margin, fontSize: 8, color: "#8c8c8c" }} />
        )}
      </Page>
    </Document>
  );
}

export async function generatePdf(resume: Resume): Promise<Blob> {
  const settings = resume.settings;
  const height = settings.mode === "single" ? (settings.heightMm || 1500) : (settings.heightMm || 297);
  const firstBlob = await pdf(<ResumePdf resume={resume} pageHeightMm={height} />).toBlob();
  if (settings.mode !== "single" || settings.heightMm > 0) return firstBlob;

  const bytes = await firstBlob.arrayBuffer();
  const viewer = await getDocument({ data: bytes.slice(0) }).promise;
  const page = await viewer.getPage(1);
  const items = (await page.getTextContent()).items;
  const baselines = items.flatMap((item) => "transform" in item ? [item.transform[5]] : []);
  await viewer.destroy();
  if (!baselines.length) return firstBlob;
  const minY = Math.min(...baselines);
  const maxY = Math.max(...baselines);
  const fullHeight = mmToPt(height);
  const lower = Math.max(0, minY - mmToPt(settings.marginMm + 5));
  const upper = Math.min(fullHeight, maxY + mmToPt(settings.marginMm + 12));
  const usedHeight = Math.max(mmToPt(80), upper - lower);
  const document = await PdfLibDocument.load(bytes);
  const sheet = document.getPage(0);
  sheet.translateContent(0, -lower);
  sheet.setMediaBox(0, 0, mmToPt(settings.widthMm), usedHeight);
  sheet.setCropBox(0, 0, mmToPt(settings.widthMm), usedHeight);
  return new Blob([await document.save() as BlobPart], { type: "application/pdf" });
}

export async function inspectPdf(blob: Blob): Promise<{ pages: number; widthMm: number; heightMm: number }> {
  const document = await getDocument({ data: await blob.arrayBuffer() }).promise;
  const page = await document.getPage(1);
  const viewport = page.getViewport({ scale: 1 });
  const result = {
    pages: document.numPages,
    widthMm: Math.round(viewport.width * 25.4 / 72),
    heightMm: Math.round(viewport.height * 25.4 / 72),
  };
  await document.destroy();
  return result;
}
