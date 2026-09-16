import { GuaranteesMotion } from "@/components/sections/guarantees-motion";
import { guarantees } from "@/data/content";

/** Section 11 - Risk reversal. */
export function Guarantees() {
  return <GuaranteesMotion items={guarantees} />;
}
