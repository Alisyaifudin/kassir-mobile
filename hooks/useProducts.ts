import { useAsync } from "./useAsync";
import { useDB } from "./useDB";

export const useProducts = () => {
	const db = useDB();
	const state = useAsync(() => db.product.getAll(), ['fetch-products']);
  return state;
};