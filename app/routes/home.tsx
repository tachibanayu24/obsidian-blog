import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Hokori note" },
    { name: "description", content: "Obsidianのノートを公開するブログ" },
  ];
}

export function Home() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Hokori note</h1>
      <p className="mb-4">Obsidianのノートを公開するブログです。</p>
      <p>あなたの知識を共有し、整理するためのスペースです。</p>
    </div>
  );
}

export default Home;
