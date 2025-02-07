import { GiEagleEmblem } from "react-icons/gi";

export default function Header() {
  return (
    <header className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2">
          <GiEagleEmblem className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">SiPalingPancasila</h1>
            <p className="text-sm opacity-90">
              AI-powered Indonesian regulation analysis through Pancasila principles
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}