const BoardCard = ({
  title = undefined,
  width = "full",
  height = 240,
  children,
}) => {
  return (
    <div
      className="bg-zinc-800 w-full rounded-lg p-4 gap-3 flex flex-col border-2 border-zinc-400 border-opacity-25"
      style={{ width: width, height: height }}
    >
      {title && <h1 className="text-xs font-bold text-zinc-100">{title}</h1>}

      <div className="w-full h-full relative overflow-clip rounded-lg">
        {children}
      </div>
    </div>
  );
};

export default BoardCard;
