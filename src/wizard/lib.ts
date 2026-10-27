import type { CapacityUnit } from '../api/types';

export function toGiB(value: number, unit: CapacityUnit): number {
  return unit === 'TiB' ? value * 1024 : value;
}

const IPV4_CIDR = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/;

/** True for an IPv4 CIDR block such as `10.20.0.0/16` (octets 0–255, prefix 0–32). */
export function isValidCidr(value: string): boolean {
  const match = IPV4_CIDR.exec(value.trim());
  if (!match) return false;
  const [, a, b, c, d, prefix] = match;
  return [a, b, c, d].every((octet) => Number(octet) <= 255) && Number(prefix) <= 32;
}

export function formatCapacity(gib: number): string {
  if (gib >= 1024 && gib % 1024 === 0) return `${(gib / 1024).toLocaleString()} TiB`;
  return `${gib.toLocaleString()} GiB`;
}

export function formatFree(freeGiB: number): string {
  return `${formatCapacity(freeGiB)} free`;
}

export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}
