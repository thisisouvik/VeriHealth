import { preprodUsers, cohortSummary } from "@/data/preprodUsers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DirectoryPage() {
  return (
    <div className="container mx-auto py-10 max-w-6xl">
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Preprod User Directory</h1>
        <p className="text-xl text-muted-foreground">
          Live roster of {cohortSummary.total} verified Alpha, Beta, Gamma, and Delta cohort users testing VeriHealth on the Midnight PREPROD network.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Alpha Cohort</CardDescription>
            <CardTitle className="text-3xl">{cohortSummary.Alpha}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Beta Cohort</CardDescription>
            <CardTitle className="text-3xl">{cohortSummary.Beta}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Gamma Cohort</CardDescription>
            <CardTitle className="text-3xl">{cohortSummary.Gamma}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Delta Cohort</CardDescription>
            <CardTitle className="text-3xl">{cohortSummary.Delta}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Verified Wallet Addresses</CardTitle>
          <CardDescription>All addresses are validated against the mn_addr_preprod1 format.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="max-h-[600px] overflow-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 font-medium">ID</th>
                    <th className="px-6 py-3 font-medium">Wallet Address</th>
                    <th className="px-6 py-3 font-medium">Cohort</th>
                    <th className="px-6 py-3 font-medium">Role</th>
                    <th className="px-6 py-3 font-medium">Joined At</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {preprodUsers.map((user) => (
                    <tr key={user.id} className="bg-background hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 font-medium">#{user.id}</td>
                      <td className="px-6 py-4 font-mono text-xs break-all">{user.address}</td>
                      <td className="px-6 py-4">
                        <Badge variant={
                          user.cohort === 'Alpha' ? 'default' : 
                          user.cohort === 'Beta' ? 'secondary' : 
                          user.cohort === 'Gamma' ? 'outline' : 'destructive'
                        }>
                          {user.cohort}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">{user.role}</td>
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                        {new Date(user.joinedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

