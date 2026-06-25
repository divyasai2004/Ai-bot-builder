interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function WebsitePage({
  params,
}: Props) {

  const { id } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/websites/${id}`,
    {
      cache: "no-store",
    }
  );

  const data = await res.json();

  const site = data.website;

  return (
    <main className="min-h-screen p-10">

      <h1 className="text-4xl font-bold mb-8">
        Website Details
      </h1>

      <div className="border rounded-xl p-6 shadow">

        <p>
          <b>Website:</b> {site.website_url}
        </p>

        <p className="mt-3">
          <b>Industry:</b> {site.industry}
        </p>

        <p className="mt-3">
          <b>Business:</b> {site.business_type}
        </p>

        <p className="mt-3">
          <b>Bot:</b> {site.bot_name}
        </p>

        <hr className="my-6" />

        <h2 className="text-xl font-bold mb-3">
          Website Content
        </h2>

        <pre className="whitespace-pre-wrap">
          {site.website_content}
        </pre>

      </div>

    </main>
  );
}