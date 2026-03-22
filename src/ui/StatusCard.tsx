type StatusCardProps = {
  label: string;
  value: string;
  variant?: 'default' | 'success' | 'error';
};

export function StatusCard({ label, value, variant = 'default' }: StatusCardProps) {
  const valueClass =
    variant === 'success'
      ? 'xc-stat__value xc-stat__value--success'
      : variant === 'error'
        ? 'xc-stat__value xc-stat__value--error'
        : 'xc-stat__value';

  return (
    <div className="xc-stat">
      <p className="xc-stat__label">{label}</p>
      <p className={valueClass}>{value}</p>
    </div>
  );
}
