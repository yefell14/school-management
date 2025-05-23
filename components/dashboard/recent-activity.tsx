'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Activity {
  id: string;
  tipo: string;
  descripcion: string;
  fecha: string;
  usuario: {
    nombre: string;
    apellidos: string;
    avatar: string;
  };
}

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} minutos`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <ScrollArea className="h-[350px]">
      <div className="space-y-8">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarImage src={activity.usuario.avatar} alt={`${activity.usuario.nombre} ${activity.usuario.apellidos}`} />
              <AvatarFallback>
                {activity.usuario.nombre[0]}{activity.usuario.apellidos[0]}
              </AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">
                {activity.usuario.nombre} {activity.usuario.apellidos}
              </p>
              <p className="text-sm text-muted-foreground">
                {activity.tipo} - {activity.descripcion}
              </p>
            </div>
            <div className="ml-auto font-medium text-sm text-muted-foreground">
              {formatDate(activity.fecha)}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
} 