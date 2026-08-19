type Props = {
  tenant: string;
  children: React.ReactNode;
};

export default function AdminGuard({ tenant, children }: Props) {
  return (
    <div className="stack">
      <section className="panel centered">
        <h2>Area interna</h2>
        <p>
          Tenant ativo: <strong>{tenant}</strong>. A senha de acesso e validada por variavel de ambiente.
        </p>
      </section>
      {children}
    </div>
  );
}
