"use client";

export default function Avatar({
  name,
  src,
  size = 64,
}: {
  name: string;
  src?: string | null;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="rounded-full flex items-center justify-center bg-magenta-600 text-white font-bold"
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}
