import { Users, Plus, Search, MapPin, DollarSign } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"

export default async function ClientsPage() {
  // Get or create a default user for demo purposes
  let user = await prisma.user.findFirst()
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'demo@freelancer.es',
        name: 'Demo Freelancer',
        phone: '+34 123 456 789',
        address: 'Madrid, Spain',
        taxId: '12345678Z',
        retaNumber: 'RETA-001'
      }
    })
  }

  const clients = await prisma.client.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { invoices: true }
      }
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Clients</h2>
            <p className="text-gray-600">Manage your client relationships and contact information</p>
          </div>
          <Button asChild>
            <a href="/clients/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </a>
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search clients by name, email, or country..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clients.length}</div>
              <p className="text-xs text-muted-foreground">
                Active clients
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">US Clients</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clients.filter(client => client.isUSClient).length}
              </div>
              <p className="text-xs text-muted-foreground">
                USD currency clients
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">EU Clients</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {clients.filter(client => !client.isUSClient).length}
              </div>
              <p className="text-xs text-muted-foreground">
                EUR currency clients
              </p>
            </CardContent>
          </Card>
        </div>

        {clients.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No clients yet</h3>
                <p className="text-gray-500 mb-6">
                  Get started by adding your first client to track invoices and manage relationships.
                </p>
                <Button asChild>
                  <a href="/clients/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Client
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <Card key={client.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      {client.isUSClient ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          USD
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          EUR
                        </span>
                      )}
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                        {client.country}
                      </span>
                    </div>
                  </div>
                  {client.email && (
                    <CardDescription>{client.email}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {client.phone && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Phone:</span> {client.phone}
                      </div>
                    )}
                    {client.taxId && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Tax ID:</span> {client.taxId}
                      </div>
                    )}
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Invoices:</span> {client._count.invoices}
                    </div>
                    <div className="flex space-x-2 pt-3">
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/clients/${client.id}`}>View</a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/clients/${client.id}/edit`}>Edit</a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/invoices/new?clientId=${client.id}`}>Invoice</a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
    </div>
  )
}