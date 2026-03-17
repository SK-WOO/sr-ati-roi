/**
 * Area-mode OPEX calculation — shared between R memo (SR Pricing) and PC memo (Pricing Calc).
 * @param {object} p
 * @param {number} p.hwCost         HW cost basis
 * @param {number} p.area           Coverage area (m²)
 * @param {number} p.hwWarrantyRate Annual HW warranty rate (%)
 * @param {number} p.supportPerM2   Site support cost per m²
 * @param {number} p.swUpdatePerM2  SW update cost per m²
 * @param {number} p.overhaulRate   Overhaul rate (%)
 * @param {number} p.overhaulCycle  Overhaul cycle (years)
 * @param {number} p.swLicense      Annual SW license amount
 * @param {number} p.overhead       Overhead rate (%)
 * @param {number} p.margin         Margin rate (%)
 */
export function calcOpexArea({ hwCost, area, hwWarrantyRate, supportPerM2, swUpdatePerM2,
  overhaulRate, overhaulCycle, swLicense, overhead, margin }) {
  const hwWarranty  = hwCost * (hwWarrantyRate / 100);
  const siteSup     = area  * supportPerM2;
  const swUpd       = area  * swUpdatePerM2;
  const overhaulAnn = (hwCost * overhaulRate / 100) / Math.max(1, overhaulCycle);
  const opexDirect  = hwWarranty + siteSup + swUpd + overhaulAnn + swLicense;
  const opexFinal   = opexDirect * (1 + overhead / 100) * (1 + margin / 100);
  return { hwWarranty, siteSup, swUpd, overhaulAnn, opexDirect, opexFinal };
}
