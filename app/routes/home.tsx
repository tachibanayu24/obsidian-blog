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
      <h1 className="text-2xl font-bold">Hokori note</h1>
      <p>ブログの準備中です</p>
    </div>
  );
}

export default Home;
