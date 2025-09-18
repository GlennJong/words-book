
function urlWithTimestamp(url: string): string {
  const timestamp = Date.now();
  return `${url}?t=${timestamp.toString()}`;
}

export async function getData<T>(url: string): Promise<T | undefined> {
  try {
    const response = await fetch(urlWithTimestamp(url));
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
      urlWithTimestamp(url),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
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

export async function putData<T>(url: string, headers: {[key:string]: string} = {}, body: T): Promise<T | undefined> {
  try {
    const response = await fetch(
      urlWithTimestamp(url),
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          ...headers,
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