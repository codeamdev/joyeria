import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";

export default async function AdminDashboardPage() {
  await requireAdminSession();

  const [totalProducts, featuredProducts, newInquiries, newCustomOrders] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { featured: true } }),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.customOrderRequest.count({ where: { status: "NEW" } }),
  ]);

  const stats = [
    { label: "Productos totales", value: totalProducts },
    { label: "Piezas destacadas", value: featuredProducts },
    { label: "Mensajes nuevos", value: newInquiries },
    { label: "Encargos nuevos", value: newCustomOrders },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Panel</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-ink/10 bg-white/60 p-4">
            <p className="text-2xl font-semibold text-ink">{stat.value}</p>
            <p className="mt-1 text-sm text-ink/60">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
