type PlaceholderPageProps = {
  title: string;
  subtitle: string;
};

function PlaceholderPage({ title, subtitle }: PlaceholderPageProps) {
  return (
    <section className="container py-24 text-center md:py-32">
      <h1 className="text-4xl font-bold text-[#22323f] md:text-5xl">{title}</h1>
      <p className="mx-auto mt-4 max-w-2xl text-lg text-[#758389]">
        {subtitle}
      </p>
    </section>
  );
}

export default PlaceholderPage;
