import { Stack } from "expo-router";

/**
 * Layout pour le module Tasks (Productivity Hub)
 * DEV-018: Module Productivity Hub (/tasks)
 */
export default function TasksLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerBackTitle: "Retour",
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    title: "Mes Projets",
                    headerLargeTitle: true,
                }}
            />
            <Stack.Screen
                name="project/[projectId]"
                options={{
                    title: "Projet",
                }}
            />
            <Stack.Screen
                name="project/create"
                options={{
                    title: "Nouveau Projet",
                    presentation: "modal",
                }}
            />
            <Stack.Screen
                name="task/[taskId]"
                options={{
                    title: "Tâche",
                }}
            />
            <Stack.Screen
                name="task/create"
                options={{
                    title: "Nouvelle Tâche",
                    presentation: "modal",
                }}
            />
        </Stack>
    );
}
