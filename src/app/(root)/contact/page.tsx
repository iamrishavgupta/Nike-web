import { Mail, MapPin, Phone } from "lucide-react";

export const metadata = {
  title: "Contact | Nike",
  description: "Get in touch with us.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-heading-2 text-dark-900">Get in Touch</h1>
      <p className="mt-2 max-w-2xl text-body text-dark-700">
        Have a question about an order, a product, or anything else? Reach out and our team will get back to you.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <form className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-body-medium text-dark-900">Name</span>
              <input
                type="text"
                required
                className="rounded-lg border border-light-300 px-3 py-3 text-body text-dark-900 focus:border-dark-500 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-body-medium text-dark-900">Email</span>
              <input
                type="email"
                required
                className="rounded-lg border border-light-300 px-3 py-3 text-body text-dark-900 focus:border-dark-500 focus:outline-none"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-body-medium text-dark-900">Message</span>
            <textarea
              rows={6}
              required
              className="rounded-lg border border-light-300 px-3 py-3 text-body text-dark-900 focus:border-dark-500 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            className="w-fit rounded-full bg-dark-900 px-6 py-3 text-body-medium text-light-100 transition hover:opacity-90"
          >
            Send Message
          </button>
        </form>

        <aside className="flex flex-col gap-4 rounded-xl border border-light-300 p-6">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-dark-700" />
            <span className="text-body text-dark-900">support@nike.example</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-dark-700" />
            <span className="text-body text-dark-900">+1 (800) 806-6453</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-dark-700" />
            <span className="text-body text-dark-900">One Bowerman Drive, Beaverton, OR</span>
          </div>
        </aside>
      </div>
    </main>
  );
}
