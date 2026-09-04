const API_BASE_URL = "http://127.0.0.1:8000";

export async function getPayments() {
  const response = await fetch(`${API_BASE_URL}/payments/`);

  if (!response.ok) {
    throw new Error("Failed to fetch payments");
  }

  return response.json();
}

export async function createPayment(paymentData) {
  const params = new URLSearchParams({
    merchant_id: String(paymentData.merchant_id),
    customer_id: String(paymentData.customer_id),
    amount: String(paymentData.amount),
    currency: paymentData.currency || "INR",
    payment_method: paymentData.payment_method || "card",
  });

  const response = await fetch(
    `${API_BASE_URL}/payments/?${params.toString()}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create payment");
  }

  return response.json();
}

export async function assessRisk(paymentId) {
  const response = await fetch(
    `${API_BASE_URL}/risk/${paymentId}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to assess risk");
  }

  return response.json();
}

export async function getAlerts() {
  const response = await fetch(`${API_BASE_URL}/alerts/`);

  if (!response.ok) {
    throw new Error("Failed to fetch alerts");
  }

  return response.json();
}

export async function resolveAlert(alertId) {
  const response = await fetch(
    `${API_BASE_URL}/alerts/${alertId}/resolve`,
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to resolve alert");
  }

  return response.json();
}

export async function getCustomers() {
  const response = await fetch(`${API_BASE_URL}/customers/`);

  if (!response.ok) {
    throw new Error("Failed to fetch customers");
  }

  return response.json();
}

export async function getCustomerRisk(customerId) {
  const response = await fetch(
    `${API_BASE_URL}/customer-risk/${customerId}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch customer risk");
  }

  return response.json();
}