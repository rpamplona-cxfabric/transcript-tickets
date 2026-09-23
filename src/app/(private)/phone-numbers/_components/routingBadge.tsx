interface RoutingBadgeProps {
  className?: string;
  label: string;
  routing: string;
}

export const RoutingBadge = ({
  className = "",
  label,
  routing,
}: RoutingBadgeProps) => {
  const isAssigned = Boolean(routing);

  return (
    <span
      className={`inline-flex rounded-md px-2.5 pb-1 pt-1.5 text-[11px] font-bold leading-none ${
        isAssigned
          ? "bg-blue-100 text-blue-700 dark:bg-[#1e2c53] dark:text-[#b9ceff]"
          : "bg-zinc-100 text-zinc-600 dark:bg-[#1d2733] dark:text-zinc-300"
      } ${className}`}
    >
      {label}
    </span>
  );
};
