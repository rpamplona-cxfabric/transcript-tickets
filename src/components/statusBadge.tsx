interface StatusBadgeProps {
  status: string | null | undefined;
  className?: string;
}

const statusClasses: Record<string, string> = {
  active: "bg-[#09A74B] text-[#D9FFE5]",
  processed: "bg-[#09A74B] text-[#D9FFE5]",
  invited: "bg-[#FFD584] text-[#7F6127]",
  pending: "bg-[#FFD584] text-[#7F6127]",
  suspended:
    "bg-[#f2cece] text-[#bd0000] dark:bg-[#c24949] dark:text-[#6d0505]",
  ignored: "bg-[#EDF2F7] text-[#5B677C] dark:bg-[#292c32] dark:text-white",
};

export const StatusBadge = ({ status, className = "" }: StatusBadgeProps) => {
  if (!status) {
    return null;
  }

  return (
    <span
      className={`inline-flex rounded-md px-2.5 pb-1 pt-1.5 text-[11px] font-bold leading-none ${statusClasses[status.toLowerCase()] || statusClasses.active} ${className}`}
    >
      {status.toUpperCase()}
    </span>
  );
};
