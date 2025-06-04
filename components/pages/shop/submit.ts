import { Result } from "@/lib/utils";
import { Additional, Disc, Item } from "./use-item";

export async function submit(data: {
  items: Item[],
  discounts: Disc[],
  additionals: Additional[],
  record: {
    fix: number,
    round: number,
    method: DB.MethodType | null,
    pay: number,
    discVal: number,
    discKind: DiscKind
  }
}): Promise<Result<"Aplikasi bermasalah", number>> {
  
}