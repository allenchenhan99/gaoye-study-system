interface BlockMeterProps {
  value: number;
  label: string;
  className?: string;
}

export function BlockMeter({ value, label, className = "" }: BlockMeterProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const filled = Math.round(clamped / 10);

  return (
    <div
      className={`block-meter ${className}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
    >
      {Array.from({ length: 10 }, (_, index) => (
        <span
          key={index}
          data-segment
          data-filled={index < filled ? "true" : "false"}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
