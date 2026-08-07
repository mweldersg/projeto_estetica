import Link from "next/link";
import Image from "next/image";
import { instagram, INSTAGRAM_URL } from "@/lib/mock-data";

export default function Instagram() {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-garage-dark border border-garage-border rounded-2xl overflow-hidden">
        <div className="flex items-center gap-4 p-5 border-b border-garage-border">
          <span className="w-16 h-16 rounded-full overflow-hidden border-2 border-garage-red shrink-0">
            <Image
              src={instagram.avatar}
              alt={`Perfil ${instagram.handle}`}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          </span>
          <div className="min-w-0">
            <p className="font-semibold truncate">@{instagram.handle}</p>
            <p className="text-garage-muted text-sm truncate">
              Garage 765 | Estética Automotiva
            </p>
          </div>
        </div>

        <div className="flex justify-around py-4 border-b border-garage-border text-center">
          <div>
            <p className="font-bold">{instagram.posts}</p>
            <p className="text-garage-muted text-xs">posts</p>
          </div>
          <div>
            <p className="font-bold">{instagram.followers}</p>
            <p className="text-garage-muted text-xs">seguidores</p>
          </div>
          <div>
            <p className="font-bold">5.0</p>
            <p className="text-garage-muted text-xs">avaliação</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-0.5">
          {instagram.gallery.map((image, i) => (
            <div key={i} className="aspect-square overflow-hidden">
              <Image
                src={image}
                alt={`Publicação ${i + 1}`}
                width={400}
                height={400}
                unoptimized
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        <div className="p-5">
          <Link
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 text-center bg-garage-red text-black font-semibold rounded-lg hover:bg-garage-red-hover transition-colors"
          >
            Seguir no Instagram
          </Link>
        </div>
      </div>
    </div>
  );
}