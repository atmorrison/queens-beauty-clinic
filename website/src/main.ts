import "./styles.css";

const BOOKINGS_URL =
  import.meta.env.VITE_BOOKINGS_URL ??
  "https://outlook.office.com/bookwithme/";

const PAYMENT_API_URL =
  import.meta.env.VITE_PAYMENT_API_URL ?? "/api/createPayment";

interface CreatePaymentResponse {
  /** URL of the Verifone Hosted Checkout page to redirect the customer to. */
  redirectUrl: string;
}

function wireFooterYear(): void {
  const el = document.getElementById("year");
  if (el) el.textContent = String(new Date().getFullYear());
}

function wireBookingsLink(): void {
  const link = document.getElementById("bookings-link");
  if (link instanceof HTMLAnchorElement) {
    link.href = BOOKINGS_URL;
  }
}

function setStatus(message: string, kind: "info" | "error" = "info"): void {
  const el = document.getElementById("payment-status");
  if (!el) return;
  el.textContent = message;
  el.classList.toggle("is-error", kind === "error");
}

async function createPaymentSession(
  reference: string,
  amount: number
): Promise<CreatePaymentResponse> {
  const res = await fetch(PAYMENT_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reference, amount, currency: "NZD" })
  });
  if (!res.ok) {
    throw new Error(`Payment service responded with ${res.status}`);
  }
  return (await res.json()) as CreatePaymentResponse;
}

function wirePaymentForm(): void {
  const form = document.getElementById("payment-form");
  if (!(form instanceof HTMLFormElement)) return;

  const submit = form.querySelector<HTMLButtonElement>("button[type=submit]");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const reference = String(data.get("reference") ?? "").trim();
    const amount = Number(data.get("amount") ?? 0);

    if (!reference || !Number.isFinite(amount) || amount <= 0) {
      setStatus("Please enter a reference and a valid amount.", "error");
      return;
    }

    if (submit) submit.disabled = true;
    setStatus("Creating secure payment session…");

    try {
      const { redirectUrl } = await createPaymentSession(reference, amount);
      setStatus("Redirecting to secure payment…");
      window.location.assign(redirectUrl);
    } catch (err) {
      console.error(err);
      setStatus(
        "We couldn't start a payment session. Please try again or contact the clinic.",
        "error"
      );
      if (submit) submit.disabled = false;
    }
  });
}

wireFooterYear();
wireBookingsLink();
wirePaymentForm();
