import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const useAuthRequest = async (
  path: string,
  options = {},
  state: { token: string | null; expiry: Date | null },
) => {
  // Token expired or user not logged in, send to homepage.
  if (!state.expiry || state.expiry < new Date()) {
    window.location.href = "/";
    return;
  }

  const response = await fetch(
    path,
    Object.assign({}, options, {
      headers: new Headers({
        Authorization: `Bearer ${state.token}`,
        "Content-Type": "application/json",
      }),
    }),
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return await response.json();
};

export const eventNames: {[key: string]: string} = {
  '333':  '3x3x3 Cube' ,
  '222': '2x2x2 Cube',
  '444': '4x4x4 Cube',
  '555': '5x5x5 Cube',
  '666': '6x6x6 Cube',
  '777': '7x7x7 Cube',
  '333bf': '3x3x3 Blindfolded',
  '333fm': '3x3x3 Fewest Moves',
  '333oh': '3x3x3 One-Handed',
  'minx': 'Megaminx',
  'pyram': 'Pyraminx',
  'clock': 'Clock',
  'skewb': 'Skewb',
  'sq1': 'Square-1',
  '444bf': '4x4x4 Blindfolded',
  '555bf': '5x5x5 Blindfolded',
  '333mbf': '3x3x3 Multi-Blind'
};

export const roundNames: {[key: string]: string} = {
  'r1': "Round 1",
  'r2': "Round 2",
  'r3': "Round 3",
  'r4': "Round 4",
};
