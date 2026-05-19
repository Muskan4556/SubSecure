type Props = { children: React.ReactNode };

export default function SectionLabel({ children }: Props) {
  return (
    <div className="flex items-center gap-3 mb-12">
      <span className="block w-6 h-px bg-current opacity-40" />
      <span className="text-[10px] font-mono uppercase tracking-[0.18em] opacity-50">
        {children}
      </span>
    </div>
  );
}
