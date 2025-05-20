export function Show({ when, children }: { when: boolean; children: React.ReactNode }) {
	if (!when) {
		return null;
	}
	return children;
}
