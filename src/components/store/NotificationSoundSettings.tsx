import { Volume2, VolumeX, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotificationSound, NOTIFICATION_SOUNDS } from '@/hooks/useNotificationSound';

export function NotificationSoundSettings() {
  const { 
    selectedSound, 
    setSelectedSound, 
    volume, 
    setVolume, 
    previewSound 
  } = useNotificationSound();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Som de Notificação
        </CardTitle>
        <CardDescription>
          Escolha o som que será tocado quando um novo pedido chegar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Som</Label>
          <RadioGroup
            value={selectedSound}
            onValueChange={setSelectedSound}
            className="grid gap-2"
          >
            {NOTIFICATION_SOUNDS.map((sound) => (
              <div 
                key={sound.id} 
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value={sound.id} id={sound.id} />
                  <Label htmlFor={sound.id} className="cursor-pointer font-normal">
                    {sound.name}
                  </Label>
                </div>
                {sound.path && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => previewSound(sound.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                )}
                {!sound.path && (
                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Volume</Label>
            <span className="text-sm text-muted-foreground">
              {Math.round(volume * 100)}%
            </span>
          </div>
          <div className="flex items-center gap-3">
            <VolumeX className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={[volume]}
              onValueChange={([value]) => setVolume(value)}
              max={1}
              step={0.1}
              className="flex-1"
              disabled={selectedSound === 'none'}
            />
            <Volume2 className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
