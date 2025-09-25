export async function getData<T>(url: string): Promise<T | undefined> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    return json as T;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

export async function postData<T>(url: string, body: T): Promise<T | undefined> {
  try {
    const response = await fetch(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: JSON.stringify(body),
      }
    );
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();
    return json as T;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
