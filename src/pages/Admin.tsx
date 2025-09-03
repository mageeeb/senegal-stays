import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, CheckCircle, XCircle, Eye, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Property {
  id: string;
  title: string;
  city: string;
  validation_status: string | null;
  created_at: string;
  host_id: string;
  rejection_reason?: string | null;
}

interface ValidationCriteria {
  id: string;
  name: string;
  description: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [criteria, setCriteria] = useState<ValidationCriteria[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingChanges, setPendingChanges] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Vérification simplifiée par email au lieu des rôles
    if (user?.email !== 'nanouchkaly@yahoo.fr') {
      navigate('/');
      return;
    }
    // Pour l'utilisateur super admin, charger directement les données
    fetchData();
  }, [user?.email, navigate]);

  const fetchData = async () => {
    try {
      // Fetch all properties for super admin
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('id, title, city, validation_status, created_at, host_id, rejection_reason')
        .order('created_at', { ascending: false });

      if (propertiesError) throw propertiesError;

      // Fetch validation criteria
      const { data: criteriaData, error: criteriaError } = await supabase
        .from('validation_criteria')
        .select('*')
        .eq('is_active', true);

      if (criteriaError) throw criteriaError;

      setProperties(propertiesData || []);
      setCriteria(criteriaData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteProperty = async (propertyId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce logement ?')) return;

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;

      setProperties(prev => prev.filter(p => p.id !== propertyId));
      toast({
        title: "Succès",
        description: "Logement supprimé avec succès",
      });
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le logement",
        variant: "destructive",
      });
    }
  };

  const updateValidationStatus = async (
    propertyId: string, 
    status: 'approved' | 'rejected'
  ) => {
    try {
      const updateData: any = {
        validation_status: status,
        validated_at: new Date().toISOString(),
        validated_by: user?.id,
      };

      // Si rejeté, ajouter la raison spécifique
      if (status === 'rejected') {
        updateData.rejection_reason = 'Identité non conforme';
      }

      const { error } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', propertyId);

      if (error) throw error;

      setProperties(prev => 
        prev.map(p => 
          p.id === propertyId 
            ? { ...p, validation_status: status, rejection_reason: status === 'rejected' ? 'Identité non conforme' : null }
            : p
        )
      );

      // Ajouter aux changements en attente
      setPendingChanges(prev => new Set([...prev, propertyId]));

      toast({
        title: "Action enregistrée",
        description: status === 'approved' 
          ? "Logement approuvé - N'oubliez pas de sauvegarder" 
          : "Logement rejeté (Identité non conforme) - N'oubliez pas de sauvegarder",
        variant: status === 'approved' ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Error updating validation status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  const saveAllChanges = async () => {
    if (pendingChanges.size === 0) {
      toast({
        title: "Information",
        description: "Aucun changement à sauvegarder",
      });
      return;
    }

    setSaving(true);
    try {
      // Les changements sont déjà enregistrés en base, on fait juste une vérification
      const { data, error } = await supabase
        .from('properties')
        .select('id, validation_status')
        .in('id', Array.from(pendingChanges));

      if (error) throw error;

      setPendingChanges(new Set());
      
      toast({
        title: "Succès",
        description: `${pendingChanges.size} modification(s) sauvegardée(s)`,
      });

      // Rediriger vers la page d'accueil après 1 seconde
      setTimeout(() => {
        navigate('/');
      }, 1000);

    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Vérification simplifiée par email
  if (user?.email !== 'nanouchkaly@yahoo.fr') {
    return null;
  }

  const pendingProperties = properties.filter(p => p.validation_status === 'pending' || p.validation_status === null);
  const approvedProperties = properties.filter(p => p.validation_status === 'approved');
  const rejectedProperties = properties.filter(p => p.validation_status === 'rejected');

  const getStatusBadge = (property: Property) => {
    const isPending = pendingChanges.has(property.id);
    
    switch (property.validation_status) {
      case 'pending':
      case null:
        return <Badge className="bg-orange-500 text-white">Cours de validation</Badge>;
      case 'approved':
        return (
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500">Identité vérifiée</Badge>
            {isPending && <Badge variant="outline" className="text-xs">Non sauvegardé</Badge>}
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="bg-red-500">
              Identité non conforme
            </Badge>
            {isPending && <Badge variant="outline" className="text-xs">Non sauvegardé</Badge>}
          </div>
        );
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const PropertyCard = ({ property }: { property: Property }) => (
    <Card key={property.id} className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{property.title}</CardTitle>
            <p className="text-muted-foreground">{property.city}</p>
          </div>
          {getStatusBadge(property)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/property/${property.id}`)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Voir
          </Button>
          {(property.validation_status === 'pending' || property.validation_status === null) && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateValidationStatus(property.id, 'approved')}
                className="text-green-600"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approuver
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateValidationStatus(property.id, 'rejected')}
                className="text-red-600"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Rejeter
              </Button>
            </>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteProperty(property.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Supprimer
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Administration</h1>
          <p className="text-muted-foreground">
            Gestion des logements et validation de conformité
          </p>
        </div>
        <div className="flex gap-2">
          {pendingChanges.size > 0 && (
            <Badge variant="outline" className="text-orange-500">
              {pendingChanges.size} modification(s) non sauvegardée(s)
            </Badge>
          )}
          <Button 
            onClick={saveAllChanges} 
            disabled={saving || pendingChanges.size === 0}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                Sauvegarder & Retour
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">
            En attente ({pendingProperties.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approuvés ({approvedProperties.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejetés ({rejectedProperties.length})
          </TabsTrigger>
          <TabsTrigger value="criteria">
            Critères ({criteria.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Logements en attente de validation</h2>
            {pendingProperties.length === 0 ? (
              <p className="text-muted-foreground">Aucun logement en attente</p>
            ) : (
              pendingProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Logements approuvés</h2>
            {approvedProperties.length === 0 ? (
              <p className="text-muted-foreground">Aucun logement approuvé</p>
            ) : (
              approvedProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Logements rejetés</h2>
            {rejectedProperties.length === 0 ? (
              <p className="text-muted-foreground">Aucun logement rejeté</p>
            ) : (
              rejectedProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="criteria" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Critères de validation</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {criteria.map((criterion) => (
                <Card key={criterion.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{criterion.description}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Code: {criterion.name}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;