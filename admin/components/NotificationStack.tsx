export interface NotificationItem {
  id: number;
  text: string;
}

export function NotificationStack({ items }: { items: NotificationItem[] }): JSX.Element {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 z-50 space-y-2">
      {items.map((item) => (
        <div key={item.id} className="max-w-xs rounded-lg border border-amber-200 bg-white p-3 text-sm shadow-lg">
          {item.text}
        </div>
      ))}
    </div>
  );
}
