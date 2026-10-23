"use client";

import {
  Globe,
  Bot,
  Database,
  MessageSquare,
  BookOpen,
  Palette,
  Settings2,
  Save,
  Upload,
  Code2,
  Copy,
  ExternalLink,
  Power,
  HelpCircle,
  CheckCircle2,
  Sparkles,
  Trash2,
  Loader2,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import { useParams } from "next/navigation";
import Link from "next/link";

import WidgetPreview from "@/components/WidgetPreview";


export default function WebsitePage() {

  const params = useParams();

  const [site, setSite] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    questionsText,
    setQuestionsText,
  ] = useState("");

  const [uploadingLogo, setUploadingLogo] =
    useState(false);
  const [logoNotice, setLogoNotice] =
    useState<string | null>(null);


  useEffect(() => {

    async function load() {

      const res = await fetch(
        `/api/websites/${params.id}`
      );

      const data = await res.json();

      if (data.success) {

        setSite({
  ...data.website,

  theme:
    data.website.theme || "light",

  primary_color:
    data.website.primary_color ||
    "#2563eb",

  header_color:
    data.website.header_color ||
    "#2563eb",

  widget_position:
    data.website.widget_position ||
    "right",

  widget_width:
    data.website.widget_width || 350,

  border_radius:
    data.website.border_radius || 12,

  suggested_questions:
    Array.isArray(
      data.website.suggested_questions
    )
      ? data.website.suggested_questions
      : [],

  is_active:
    data.website.is_active !== false,
});

        setQuestionsText(
          (
            data.website
              .suggested_questions || []
          ).join("\n")
        );
      }

      setLoading(false);
    }

    load();

  }, [params.id]);


  async function saveBot() {
  if (!site) return;

  setSaving(true);

  const updatedQuestions = questionsText
    .split("\n")
    .map((question) => question.trim())
    .filter((question) => question !== "");

  const payload = {
    bot_name: site.bot_name,
    welcome_message: site.welcome_message,

    theme: site.theme || "light",

    suggested_questions: updatedQuestions,

    primary_color:
      site.primary_color || "#2563eb",

    header_color:
      site.header_color || "#2563eb",

    widget_position:
      site.widget_position || "right",

    widget_width:
      Number(site.widget_width) || 350,

    border_radius:
      Number(site.border_radius) || 12,

    logo_url:
      site.logo_url || null,

    is_active:
      site.is_active === true,
  };

  try {
    const res = await fetch(
      `/api/websites/${params.id}`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(
        data.error || "Could not save changes."
      );
    }

    setSite((prev: any) => ({
      ...prev,
      ...payload,
    }));

    alert("Bot updated successfully!");
  } catch (error: any) {
    console.error("SAVE ERROR:", error);

    alert(
      error.message ||
        "Could not save changes."
    );
  } finally {
    setSaving(false);
  }
}


  const widgetScript =
    typeof window !== "undefined"
      ? `<script
src="${window.location.origin}/widget.js"
data-bot-id="${site?.id}">
</script>`
      : "";


  if (loading) {

    return (
      <div className="min-h-screen flex items-center justify-center">

        <div className="text-center">

          <div className="w-11 h-11 border-4 border-zinc-200 border-t-blue-600 rounded-full animate-spin mx-auto" />

          <p className="text-zinc-500 mt-4">
            Loading bot settings...
          </p>

        </div>

      </div>
    );
  }


  if (!site) {

    return (
      <div className="min-h-screen flex items-center justify-center">

        <div className="text-center">

          <Bot
            size={40}
            className="mx-auto text-zinc-400"
          />

          <h2 className="text-xl font-bold mt-4">
            Bot not found
          </h2>

        </div>

      </div>
    );
  }


  return (

    <div className="min-h-screen">

      {/* STICKY PAGE HEADER */}

      <header className="
        sticky
        top-0
        z-30
        bg-white/90
        backdrop-blur-xl
        border-b
        border-zinc-200
      ">

        <div className="
          max-w-[1500px]
          mx-auto
          px-4
          sm:px-6
          md:px-8
          py-3.5
          sm:py-4
          flex
          flex-col
          sm:flex-row
          sm:items-center
          justify-between
          gap-4
        ">

          <div>

            <div className="flex items-center gap-2 text-sm text-zinc-500">

              <Settings2 size={15} />

              Bot Settings

            </div>

            <h1 className="
              text-2xl
              md:text-3xl
              font-bold
              text-zinc-950
              mt-1
            ">
              {site.bot_name}
            </h1>

          </div>


          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={`/playground/${site.id}`}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                border
                border-zinc-300
                bg-white
                hover:bg-zinc-50
                text-zinc-700
                px-4
                py-2.5
                rounded-xl
                font-semibold
                text-sm
                transition
                shadow-sm
              "
            >
              <Sparkles size={16} className="text-blue-600" />
              Playground
            </Link>

            <button
              onClick={saveBot}
              disabled={saving}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                bg-blue-600
                hover:bg-blue-700
                disabled:opacity-60
                text-white
                px-5
                py-2.5
                rounded-xl
                font-semibold
                text-sm
                transition
                shadow-lg
                shadow-blue-600/20
              "
            >
              <Save size={17} />
              {saving
                ? "Saving..."
                : "Save Changes"
              }
            </button>
          </div>

        </div>

      </header>


      {/* CONTENT */}

      <div className="
        max-w-[1500px]
        mx-auto
        p-4
        sm:p-6
        md:p-8
      ">


        {/* BOT OVERVIEW */}

        <section className="
          bg-white
          border
          border-zinc-200
          rounded-2xl
          p-6
          mb-6
        ">

          <div className="
            flex
            flex-col
            lg:flex-row
            lg:items-center
            justify-between
            gap-6
          ">

            <div>

              <div className="
                flex
                flex-wrap
                items-center
                gap-2
              ">

                <StatusBadge
                  active={site.is_active}
                />

                {site.industry && (
                  <Badge>
                    {site.industry}
                  </Badge>
                )}

                {site.business_type && (
                  <Badge>
                    {site.business_type}
                  </Badge>
                )}

              </div>


              <div className="
                flex
                items-center
                gap-2
                mt-4
                text-zinc-600
              ">

                <Globe size={17} />

                <span className="break-all">
                  {site.website_url}
                </span>

              </div>

            </div>


            <div className="
              grid
              grid-cols-3
              gap-3
              w-full
              lg:w-auto
            ">

              <MiniStat
                icon={<Database size={17} />}
                label="Products"
                value={
                  site.products?.length || 0
                }
              />

              <MiniStat
                icon={<BookOpen size={17} />}
                label="Knowledge"
                value="Ready"
              />

              <MiniStat
                icon={
                  <MessageSquare size={17} />
                }
                label="Chat"
                value={
                  site.is_active
                    ? "Live"
                    : "Paused"
                }
              />

            </div>

          </div>

        </section>


        {/* MAIN GRID */}

        <div className="
          grid
          xl:grid-cols-[minmax(0,1fr)_390px]
          2xl:grid-cols-[minmax(0,1fr)_430px]
          gap-6
          items-start
        ">


          {/* LEFT COLUMN */}

          <div className="space-y-6">


            {/* IDENTITY */}

            <SectionCard
              icon={<Bot size={20} />}
              title="Bot Identity"
              description="Configure how your assistant introduces itself to visitors."
            >

              <Field
                label="Website"
                help="The source website used to create this assistant."
              >

                <input
                  value={site.website_url}
                  disabled
                  className={disabledInput}
                />

              </Field>


              <div className="
                grid
                md:grid-cols-2
                gap-5
              ">

                <Field label="Industry">

                  <input
                    value={
                      site.industry || ""
                    }
                    disabled
                    className={disabledInput}
                  />

                </Field>


                <Field label="Business Type">

                  <input
                    value={
                      site.business_type || ""
                    }
                    disabled
                    className={disabledInput}
                  />

                </Field>

              </div>


              <Field
                label="Bot Name"
                help="This name appears in the chatbot header."
              >

                <input
                  value={site.bot_name || ""}
                  onChange={(e) =>
                    setSite({
                      ...site,
                      bot_name:
                        e.target.value,
                    })
                  }
                  className={inputClass}
                />

              </Field>


              <Field
                label="Welcome Message"
                help="The first message visitors see when opening the widget."
              >

                <textarea
                  rows={4}
                  value={
                    site.welcome_message || ""
                  }
                  onChange={(e) =>
                    setSite({
                      ...site,
                      welcome_message:
                        e.target.value,
                    })
                  }
                  className={inputClass}
                />

              </Field>

            </SectionCard>


            {/* APPEARANCE */}

            <SectionCard
              icon={<Palette size={20} />}
              title="Appearance"
              description="Customize the visual style and placement of your chatbot."
            >

              <div className="
                grid
                md:grid-cols-2
                gap-5
              ">

                <Field label="Theme">

                  <select
                    value={
                      site.theme || "light"
                    }
                    onChange={(e) =>
                      setSite({
                        ...site,
                        theme:
                          e.target.value,
                      })
                    }
                    className={inputClass}
                  >
                    <option value="light">
                      Light
                    </option>

                    <option value="dark">
                      Dark
                    </option>
                  </select>

                </Field>


                <Field label="Widget Position">

                  <select
                    value={
                      site.widget_position ||
                      "right"
                    }
                    onChange={(e) =>
                      setSite({
                        ...site,
                        widget_position:
                          e.target.value,
                      })
                    }
                    className={inputClass}
                  >

                    <option value="right">
                      Bottom Right
                    </option>

                    <option value="left">
                      Bottom Left
                    </option>

                  </select>

                </Field>

              </div>


              {/* COLORS */}

              <div className="
                grid
                md:grid-cols-2
                gap-5
              ">

                <ColorField
                  label="Primary Color"
                  value={
                    site.primary_color ||
                    "#2563eb"
                  }
                  onChange={(value) =>
                    setSite({
                      ...site,
                      primary_color: value,
                    })
                  }
                />


                <ColorField
                  label="Header Color"
                  value={
                    site.header_color ||
                    "#2563eb"
                  }
                  onChange={(value) =>
                    setSite({
                      ...site,
                      header_color: value,
                    })
                  }
                />

              </div>


              <div className="
                grid
                md:grid-cols-2
                gap-5
              ">

                <Field
                  label="Widget Width"
                  help="Recommended range: 320–450 px."
                >

                  <div className="relative">

                    <input
                      type="number"
                      value={
                        site.widget_width ||
                        350
                      }
                      onChange={(e) =>
                        setSite({
                          ...site,
                          widget_width:
                            Number(
                              e.target.value
                            ),
                        })
                      }
                      className={`${inputClass} pr-14`}
                    />

                    <span className="
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-sm
                      text-zinc-400
                    ">
                      px
                    </span>

                  </div>

                </Field>


                <Field
                  label="Border Radius"
                  help="Controls widget corner roundness."
                >

                  <div className="relative">

                    <input
                      type="number"
                      value={
                        site.border_radius ||
                        12
                      }
                      onChange={(e) =>
                        setSite({
                          ...site,
                          border_radius:
                            Number(
                              e.target.value
                            ),
                        })
                      }
                      className={`${inputClass} pr-14`}
                    />

                    <span className="
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-sm
                      text-zinc-400
                    ">
                      px
                    </span>

                  </div>

                </Field>

              </div>


              {/* LOGO */}

              <Field
                label="Bot Logo"
                help="Upload an image used in the launcher and chatbot header (Max 5 MB)."
              >

                <div className="
                  border
                  border-dashed
                  border-zinc-300
                  rounded-xl
                  p-4
                  flex
                  flex-col
                  sm:flex-row
                  sm:items-center
                  gap-4
                ">

                  {/* Logo Preview Avatar */}
                  <div className="
                    w-16
                    h-16
                    rounded-xl
                    bg-zinc-100
                    border
                    border-zinc-200
                    flex
                    items-center
                    justify-center
                    overflow-hidden
                    shrink-0
                    relative
                  ">
                    {uploadingLogo ? (
                      <Loader2
                        size={24}
                        className="text-blue-600 animate-spin"
                      />
                    ) : site.logo_url ? (
                      <img
                        src={site.logo_url}
                        alt="Bot logo"
                        onError={() => {
                          setSite((prev: any) => ({
                            ...prev,
                            logo_url: null,
                          }));
                        }}
                        className="
                          w-full
                          h-full
                          object-cover
                        "
                      />
                    ) : (
                      <Bot
                        size={25}
                        className="text-zinc-400"
                      />
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Upload / Change Button */}
                    <label className={`
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      border
                      border-zinc-300
                      bg-white
                      hover:bg-zinc-50
                      px-4
                      py-2.5
                      rounded-lg
                      text-sm
                      font-medium
                      transition
                      ${uploadingLogo ? "opacity-60 cursor-not-allowed pointer-events-none" : "cursor-pointer"}
                    `}>
                      {uploadingLogo ? (
                        <>
                          <Loader2 size={17} className="animate-spin text-blue-600" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={17} />
                          <span>{site.logo_url ? "Change Logo" : "Upload Logo"}</span>
                        </>
                      )}

                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingLogo}
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          // Reset input so selecting the same file later works
                          const target = e.target;

                          // Client-side validations
                          if (!file.type || !file.type.startsWith("image/")) {
                            alert("Please select a valid image file (PNG, JPG, WebP, SVG, etc.).");
                            target.value = "";
                            return;
                          }

                          if (file.size > 5 * 1024 * 1024) {
                            alert("File size exceeds 5 MB. Please select a smaller image.");
                            target.value = "";
                            return;
                          }

                          setUploadingLogo(true);
                          setLogoNotice(null);

                          try {
                            const form = new FormData();
                            form.append("file", file);

                            const res = await fetch("/api/upload-logo", {
                              method: "POST",
                              body: form,
                            });

                            const data = await res.json();

                            if (!data.success) {
                              throw new Error(data.error || "Upload failed");
                            }

                            // 1. Update local state
                            setSite((prev: any) => ({
                              ...prev,
                              logo_url: data.url,
                            }));

                            // 2. Immediately persist to database so it isn't lost if user navigates
                            const updatedQuestions = questionsText
                              .split("\n")
                              .map((q) => q.trim())
                              .filter((q) => q !== "");

                            const updateRes = await fetch(`/api/websites/${params.id}`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                bot_name: site.bot_name,
                                welcome_message: site.welcome_message,
                                theme: site.theme || "light",
                                suggested_questions: updatedQuestions,
                                primary_color: site.primary_color || "#2563eb",
                                header_color: site.header_color || "#2563eb",
                                widget_position: site.widget_position || "right",
                                widget_width: Number(site.widget_width) || 350,
                                border_radius: Number(site.border_radius) || 12,
                                logo_url: data.url,
                                is_active: site.is_active === true,
                              }),
                            });

                            const updateData = await updateRes.json();
                            if (!updateRes.ok || !updateData.success) {
                              console.warn("Could not auto-save logo to database, please click Save Changes.");
                            } else {
                              setLogoNotice("Logo uploaded and saved successfully!");
                              setTimeout(() => setLogoNotice(null), 4000);
                            }
                          } catch (err: any) {
                            console.error("Upload logo error:", err);
                            alert(err?.message || "Failed to upload image. Please try again.");
                          } finally {
                            target.value = "";
                            setUploadingLogo(false);
                          }
                        }}
                      />
                    </label>

                    {/* Remove Logo Button */}
                    {site.logo_url && (
                      <button
                        type="button"
                        disabled={uploadingLogo}
                        onClick={async () => {
                          const ok = confirm("Are you sure you want to remove the bot logo?");
                          if (!ok) return;

                          setSite((prev: any) => ({
                            ...prev,
                            logo_url: null,
                          }));

                          try {
                            const updatedQuestions = questionsText
                              .split("\n")
                              .map((q) => q.trim())
                              .filter((q) => q !== "");

                            await fetch(`/api/websites/${params.id}`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                bot_name: site.bot_name,
                                welcome_message: site.welcome_message,
                                theme: site.theme || "light",
                                suggested_questions: updatedQuestions,
                                primary_color: site.primary_color || "#2563eb",
                                header_color: site.header_color || "#2563eb",
                                widget_position: site.widget_position || "right",
                                widget_width: Number(site.widget_width) || 350,
                                border_radius: Number(site.border_radius) || 12,
                                logo_url: null,
                                is_active: site.is_active === true,
                              }),
                            });

                            setLogoNotice("Logo removed successfully.");
                            setTimeout(() => setLogoNotice(null), 3000);
                          } catch (err) {
                            console.error("Error removing logo:", err);
                          }
                        }}
                        className="
                          inline-flex
                          items-center
                          justify-center
                          gap-1.5
                          border
                          border-red-200
                          bg-red-50
                          hover:bg-red-100
                          text-red-700
                          px-3.5
                          py-2.5
                          rounded-lg
                          text-sm
                          font-medium
                          transition
                        "
                      >
                        <Trash2 size={15} />
                        Remove
                      </button>
                    )}
                  </div>

                  {logoNotice && (
                    <div className="w-full text-xs text-emerald-600 font-medium flex items-center gap-1.5 mt-1">
                      <CheckCircle2 size={14} />
                      {logoNotice}
                    </div>
                  )}

                </div>

              </Field>

            </SectionCard>


            {/* SUGGESTIONS */}

            <SectionCard
              icon={<HelpCircle size={20} />}
              title="Suggested Questions"
              description="Add starter questions that visitors can click inside the widget."
            >

              <textarea
                rows={7}
                value={questionsText}
                onChange={(e) =>
                  setQuestionsText(
                    e.target.value
                  )
                }
                placeholder={`Tell me about your products
What are your latest releases?
How can I contact support?`}
                className={inputClass}
              />

              <div className="
                flex
                items-center
                justify-between
                text-xs
                text-zinc-500
              ">

                <span>
                  Enter one question per line.
                </span>

                <span>
                  {
                    questionsText
                      .split("\n")
                      .filter(
                        (q) =>
                          q.trim() !== ""
                      ).length
                  } questions
                </span>

              </div>

            </SectionCard>


            {/* STATUS */}

            <SectionCard
              icon={<Power size={20} />}
              title="Bot Availability"
              description="Control whether visitors can currently use this assistant."
            >

              <div className={`
                rounded-xl
                border
                p-5
                flex
                flex-col
                sm:flex-row
                sm:items-center
                justify-between
                gap-4

                ${
                  site.is_active
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-red-50 border-red-200"
                }
              `}>

                <div>

                  <div className="
                    flex
                    items-center
                    gap-2
                    font-semibold
                  ">

                    <span className={`
                      w-2.5
                      h-2.5
                      rounded-full

                      ${
                        site.is_active
                          ? "bg-emerald-500"
                          : "bg-red-500"
                      }
                    `} />

                    {site.is_active
                      ? "Bot is active"
                      : "Bot is paused"
                    }

                  </div>

                  <p className="
                    text-sm
                    text-zinc-600
                    mt-1
                  ">
                    {site.is_active
                      ? "Visitors can currently open and use your chatbot."
                      : "The public chatbot is temporarily unavailable."
                    }
                  </p>

                </div>


                <button
                  type="button"
                  onClick={() =>
                    setSite(
                      (prev: any) => ({
                        ...prev,
                        is_active:
                          !prev.is_active,
                      })
                    )
                  }
                  className={`
                    px-5
                    py-2.5
                    rounded-lg
                    text-sm
                    font-semibold
                    transition

                    ${
                      site.is_active
                        ? "bg-white border border-red-200 text-red-600 hover:bg-red-50"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }
                  `}
                >
                  {site.is_active
                    ? "Pause Bot"
                    : "Activate Bot"
                  }
                </button>

              </div>

            </SectionCard>


            {/* INSTALLATION */}

            <SectionCard
              icon={<Code2 size={20} />}
              title="Deploy Widget"
              description="Install this assistant on your website."
            >

              <Field label="Bot ID">

                <div className="flex gap-2">

                  <input
                    readOnly
                    value={site.id}
                    className={`${disabledInput} font-mono text-sm`}
                  />

                  <CopyButton
                    onClick={() => {

                      navigator.clipboard
                        .writeText(site.id);

                      alert(
                        "Bot ID copied!"
                      );
                    }}
                  />

                </div>

              </Field>


              <Field label="Installation Script">

                <textarea
                  readOnly
                  value={widgetScript}
                  rows={5}
                  className={`
                    ${disabledInput}
                    font-mono
                    text-sm
                    resize-none
                  `}
                />

              </Field>


              <div className="
                flex
                flex-col
                sm:flex-row
                gap-3
              ">

                <button
                  onClick={() => {

                    navigator.clipboard
                      .writeText(
                        widgetScript
                      );

                    alert(
                      "Installation script copied!"
                    );
                  }}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    bg-blue-600
                    hover:bg-blue-700
                    text-white
                    px-5
                    py-3
                    rounded-xl
                    font-semibold
                  "
                >
                  <Copy size={17} />

                  Copy Script
                </button>


                <button
                  onClick={() =>
                   window.open(
  `/test?botId=${site.id}`,
  "_blank"
)
                  }
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    border
                    border-zinc-300
                    bg-white
                    hover:bg-zinc-50
                    px-5
                    py-3
                    rounded-xl
                    font-semibold
                  "
                >
                  <ExternalLink size={17} />

                  Test Widget
                </button>

              </div>


              <div className="
                bg-blue-50
                border
                border-blue-200
                rounded-xl
                p-5
              ">

                <h3 className="
                  font-semibold
                  text-blue-950
                ">
                  Installation Guide
                </h3>

                <div className="
                  mt-4
                  space-y-3
                ">

                  <GuideStep
                    number="1"
                    text="Copy the installation script."
                  />

                  <GuideStep
                    number="2"
                    text="Paste it before the closing body tag of your website."
                  />

                  <GuideStep
                    number="3"
                    text="Save and deploy your website."
                  />

                  <GuideStep
                    number="4"
                    text="Refresh the website and test the assistant."
                  />

                </div>

              </div>

            </SectionCard>


            {/* WEBSITE CONTENT */}

            <details className="
              bg-white
              border
              border-zinc-200
              rounded-2xl
              overflow-hidden
            ">

              <summary className="
                px-6
                py-5
                cursor-pointer
                font-semibold
                hover:bg-zinc-50
              ">
                Crawled Website Content
              </summary>

              <div className="
                border-t
                border-zinc-200
                p-5
              ">

                <pre className="
                  whitespace-pre-wrap
                  text-sm
                  text-zinc-600
                  bg-zinc-50
                  border
                  border-zinc-200
                  rounded-xl
                  p-5
                  max-h-[500px]
                  overflow-auto
                ">
                  {site.website_content}
                </pre>

              </div>

            </details>

          </div>


          {/* RIGHT PREVIEW COLUMN */}

          <aside className="
            xl:sticky
            xl:top-28
          ">

            <div className="
              bg-white
              border
              border-zinc-200
              rounded-2xl
              overflow-hidden
            ">

              <div className="
                px-5
                py-4
                border-b
                border-zinc-200
                flex
                items-center
                justify-between
              ">

                <div>

                  <h2 className="font-semibold">
                    Live Preview
                  </h2>

                  <p className="
                    text-xs
                    text-zinc-500
                    mt-1
                  ">
                    Updates as you customize
                  </p>

                </div>

                <span className="
                  flex
                  items-center
                  gap-1.5
                  text-xs
                  text-emerald-600
                  bg-emerald-50
                  px-2.5
                  py-1.5
                  rounded-full
                ">
                  <CheckCircle2 size={13} />

                  Live
                </span>

              </div>


              <div className="
                bg-zinc-100
                p-2
                sm:p-4
                min-h-[640px]
                overflow-hidden
              ">

                <WidgetPreview
                  botName={site.bot_name}
                  welcomeMessage={
                    site.welcome_message
                  }
                  logoUrl={site.logo_url}
                  theme={site.theme}
                  primaryColor={
                    site.primary_color ||
                    "#2563eb"
                  }
                  headerColor={
                    site.header_color ||
                    "#2563eb"
                  }
                  widgetWidth={
                    site.widget_width ||
                    350
                  }
                  borderRadius={
                    site.border_radius ||
                    12
                  }
suggestedQuestions={
  questionsText
    .split("\n")
    .map((question) => question.trim())
    .filter((question) => question !== "")
}                />

              </div>

            </div>

          </aside>

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   REUSABLE COMPONENTS
========================================================= */


const inputClass = `
  w-full
  border
  border-zinc-300
  bg-white
  rounded-xl
  px-4
  py-3
  text-zinc-900
  outline-none
  transition
  focus:border-blue-500
  focus:ring-4
  focus:ring-blue-500/10
`;


const disabledInput = `
  w-full
  border
  border-zinc-200
  bg-zinc-50
  rounded-xl
  px-4
  py-3
  text-zinc-600
  outline-none
`;


function SectionCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {

  return (

    <section className="
      bg-white
      border
      border-zinc-200
      rounded-2xl
      overflow-hidden
    ">

      <div className="
        px-6
        py-5
        border-b
        border-zinc-200
        flex
        items-start
        gap-3
      ">

        <div className="
          w-10
          h-10
          rounded-xl
          bg-blue-50
          text-blue-600
          flex
          items-center
          justify-center
          shrink-0
        ">
          {icon}
        </div>

        <div>

          <h2 className="
            text-lg
            font-bold
            text-zinc-950
          ">
            {title}
          </h2>

          <p className="
            text-sm
            text-zinc-500
            mt-1
          ">
            {description}
          </p>

        </div>

      </div>


      <div className="
        p-6
        space-y-5
      ">
        {children}
      </div>

    </section>
  );
}


function Field({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: React.ReactNode;
}) {

  return (

    <div>

      <label className="
        text-sm
        font-semibold
        text-zinc-800
        block
        mb-2
      ">
        {label}
      </label>

      {children}

      {help && (
        <p className="
          text-xs
          text-zinc-500
          mt-2
        ">
          {help}
        </p>
      )}

    </div>
  );
}


function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {

  return (

    <Field label={label}>

      <div className="
        flex
        items-center
        gap-3
        border
        border-zinc-300
        rounded-xl
        p-2
      ">

        <input
          type="color"
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="
            w-12
            h-10
            rounded-lg
            cursor-pointer
            border-0
            bg-transparent
          "
        />

        <input
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className="
            flex-1
            min-w-0
            outline-none
            font-mono
            text-sm
            uppercase
          "
        />

      </div>

    </Field>
  );
}


function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {

  return (

    <div className="
      min-w-0
      bg-zinc-50
      border
      border-zinc-200
      rounded-xl
      px-4
      py-3
    ">

      <div className="
        flex
        items-center
        gap-2
        text-zinc-500
      ">
        {icon}

        <span className="
          text-xs
          truncate
        ">
          {label}
        </span>
      </div>

      <p className="
        font-bold
        text-zinc-950
        mt-2
        truncate
      ">
        {value}
      </p>

    </div>
  );
}


function StatusBadge({
  active,
}: {
  active: boolean;
}) {

  return (

    <span className={`
      inline-flex
      items-center
      gap-2
      px-3
      py-1.5
      rounded-full
      text-xs
      font-semibold

      ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-red-50 text-red-700"
      }
    `}>

      <span className={`
        w-2
        h-2
        rounded-full

        ${
          active
            ? "bg-emerald-500"
            : "bg-red-500"
        }
      `} />

      {active ? "Active" : "Paused"}

    </span>
  );
}


function Badge({
  children,
}: {
  children: React.ReactNode;
}) {

  return (

    <span className="
      px-3
      py-1.5
      rounded-full
      text-xs
      font-medium
      bg-zinc-100
      text-zinc-600
    ">
      {children}
    </span>
  );
}


function CopyButton({
  onClick,
}: {
  onClick: () => void;
}) {

  return (

    <button
      onClick={onClick}
      className="
        shrink-0
        border
        border-zinc-300
        bg-white
        hover:bg-zinc-50
        px-4
        rounded-xl
        flex
        items-center
        gap-2
        font-medium
      "
    >
      <Copy size={17} />

      <span className="hidden sm:inline">
        Copy
      </span>
    </button>
  );
}


function GuideStep({
  number,
  text,
}: {
  number: string;
  text: string;
}) {

  return (

    <div className="
      flex
      items-start
      gap-3
    ">

      <div className="
        w-6
        h-6
        rounded-full
        bg-blue-600
        text-white
        text-xs
        font-bold
        flex
        items-center
        justify-center
        shrink-0
      ">
        {number}
      </div>

      <p className="
        text-sm
        text-blue-950
        pt-0.5
      ">
        {text}
      </p>

    </div>
  );
}
