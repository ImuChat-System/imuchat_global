
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/providers/I18nProvider';
import {
  Wrench,
  Zap,
  KeyRound,
  Sparkles,
  Leaf,
  Hammer,
  Paintbrush,
  Baby,
  HeartHandshake,
  Users,
  BookUser,
  Heart,
  ChefHat,
  Dumbbell,
  Scissors,
  Home,
  Dog,
  ShieldAlert,
  Shield,
  Stethoscope,
  FileText,
  BatteryCharging,
  Car,
} from 'lucide-react';
import { useNavigation } from '@/hooks/use-navigation';
const categories = [
  {
    titleKey: 'domestic.title',
    items: [
      { nameKey: 'domestic.plumber', icon: <Wrench className="h-6 w-6 text-blue-500" /> },
      { nameKey: 'domestic.electrician', icon: <Zap className="h-6 w-6 text-yellow-500" /> },
      { nameKey: 'domestic.locksmith', icon: <KeyRound className="h-6 w-6 text-gray-500" /> },
      { nameKey: 'domestic.cleaning', icon: <Sparkles className="h-6 w-6 text-cyan-500" /> },
      { nameKey: 'domestic.gardener', icon: <Leaf className="h-6 w-6 text-green-500" /> },
      { nameKey: 'domestic.handyman', icon: <Hammer className="h-6 w-6 text-orange-500" /> },
      { nameKey: 'domestic.decorator', icon: <Paintbrush className="h-6 w-6 text-pink-500" /> },
    ],
  },
  {
    titleKey: 'family.title',
    items: [
      { nameKey: 'family.babysitter', icon: <Baby className="h-6 w-6 text-purple-500" /> },
      { nameKey: 'family.homeHelp', icon: <HeartHandshake className="h-6 w-6 text-red-500" /> },
      { nameKey: 'family.parentingCoach', icon: <Users className="h-6 w-6 text-teal-500" /> },
      { nameKey: 'family.tutor', icon: <BookUser className="h-6 w-6 text-indigo-500" /> },
      { nameKey: 'family.psychologist', icon: <Heart className="h-6 w-6 text-rose-500" /> },
    ],
  },
  {
    titleKey: 'wellness.title',
    items: [
      { nameKey: 'wellness.chef', icon: <ChefHat className="h-6 w-6 text-orange-600" /> },
      { nameKey: 'wellness.fitnessCoach', icon: <Dumbbell className="h-6 w-6 text-blue-600" /> },
      { nameKey: 'wellness.beautician', icon: <Scissors className="h-6 w-6 text-pink-600" /> },
      { nameKey: 'wellness.smartHomeTech', icon: <Home className="h-6 w-6 text-gray-600" /> },
      { nameKey: 'wellness.vet', icon: <Dog className="h-6 w-6 text-yellow-700" /> },
    ],
  },
  {
      titleKey: 'security.title',
      items: [
        { nameKey: 'security.emergencyLocksmith', icon: <ShieldAlert className="h-6 w-6 text-red-600" /> },
        { nameKey: 'security.privateSecurity', icon: <Shield className="h-6 w-6 text-gray-700" /> },
        { nameKey: 'security.applianceRepair', icon: <Wrench className="h-6 w-6 text-orange-700" /> },
        { nameKey: 'security.medicalAssistance', icon: <Stethoscope className="h-6 w-6 text-blue-700" /> },
        { nameKey: 'security.insurance', icon: <FileText className="h-6 w-6 text-indigo-700" /> },
      ]
  },
  {
      titleKey: 'mobility.title',
      items: [
        { nameKey: 'mobility.evTechnician', icon: <BatteryCharging className="h-6 w-6 text-green-600" /> },
        { nameKey: 'mobility.mobileMechanic', icon: <Car className="h-6 w-6 text-gray-800" /> },
        { nameKey: 'mobility.driver', icon: <Users className="h-6 w-6 text-purple-600" /> },
      ]
  }
];

export function CategoryGrid() {
  const t = useTranslations('ServicesPage.categories');
  const { pathname } = useNavigation();
  return (
    <div className="space-y-8">
      {categories.map((categoryGroup) => (
        <Card key={categoryGroup.titleKey}>
          <CardHeader>
            <CardTitle>{t(categoryGroup.titleKey as any)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categoryGroup.items.map((item) => (
                <a key={item.nameKey} href={`/services/category/${item.nameKey}`}>
                  <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-3">
                      {item.icon}
                      <span className="text-sm font-semibold">{t(item.nameKey as any)}</span>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
