import { appIcons } from "./icons";

export default function PlayerInfo({
  name,
  image,
  rating,
  title,
  isTop,
}: PlayerInfoProps) {
  return (
    <div className={`flex items-center gap-2 p-2 ${isTop ? "mb-2" : "mt-2"}`}>
      <img
        src={image || appIcons.mainIcon}
        alt={name}
        className="w-8 h-8 rounded"
      />
      <span className="text-white font-medium">{name}</span>
      <span className="text-yellow-500 text-sm">{title}</span>
      <span className="text-gray-400 text-sm">({rating})</span>
    </div>
  );
}
