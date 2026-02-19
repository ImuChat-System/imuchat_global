/**
 * Composant NotificationPrompt - Demande de permission notifications
 *
 * Affiche une modal élégante pour demander la permission d'envoyer des notifications
 * push. S'affiche automatiquement au premier lancement.
 *
 * Features:
 * - Modal kawaii avec mascotte ImuChat
 * - Explication claire des bénéfices
 * - Boutons Accepter / Refuser
 * - Ne s'affiche qu'une seule fois
 */

import { useNotifications } from "@/hooks/useNotifications";
import { KawaiiButton } from "@imuchat/ui-kit/native";
import React from "react";
import { Modal, StyleSheet, Text, View } from "react-native";

export interface NotificationPromptProps {
  /** Visible ou non */
  visible: boolean;
  /** Callback quand on ferme */
  onClose: () => void;
}

export const NotificationPrompt: React.FC<NotificationPromptProps> = ({
  visible,
  onClose,
}) => {
  const { requestPermission } = useNotifications();
  const [isRequesting, setIsRequesting] = React.useState(false);

  const handleAccept = async () => {
    setIsRequesting(true);
    try {
      const granted = await requestPermission();
      console.log("Notification permission:", granted ? "granted" : "denied");
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    } finally {
      setIsRequesting(false);
      onClose();
    }
  };

  const handleDecline = () => {
    // Stocker le refus pour ne plus redemander
    // TODO: Utiliser AsyncStorage pour persister
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Icône notification */}
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🔔</Text>
          </View>

          {/* Titre */}
          <Text style={styles.title}>Activer les notifications ?</Text>

          {/* Description */}
          <Text style={styles.description}>
            Recevez des notifications pour :
          </Text>

          {/* Liste bénéfices */}
          <View style={styles.benefitsList}>
            <BenefitItem icon="💬" text="Nouveaux messages" />
            <BenefitItem icon="📞" text="Appels manqués" />
            <BenefitItem icon="👥" text="Invitations" />
            <BenefitItem icon="🎉" text="Événements importants" />
          </View>

          {/* Note confidentialité */}
          <Text style={styles.privacyNote}>
            Vos données restent privées. Vous pouvez désactiver les
            notifications à tout moment dans les paramètres.
          </Text>

          {/* Boutons */}
          <View style={styles.buttons}>
            <KawaiiButton
              variant="outline"
              onPress={handleDecline}
              disabled={isRequesting}
              style={styles.declineButton}
            >
              Plus tard
            </KawaiiButton>

            <KawaiiButton
              emoji="🔔"
              variant="primary"
              onPress={handleAccept}
              loading={isRequesting}
              disabled={isRequesting}
              style={styles.acceptButton}
            >
              Activer
            </KawaiiButton>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// === COMPOSANT BÉNÉFICE ===

interface BenefitItemProps {
  icon: string;
  text: string;
}

const BenefitItem: React.FC<BenefitItemProps> = ({ icon, text }) => (
  <View style={styles.benefitItem}>
    <Text style={styles.benefitIcon}>{icon}</Text>
    <Text style={styles.benefitText}>{text}</Text>
  </View>
);

// === STYLES ===

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFD93D",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A2E",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#6B6B7E",
    marginBottom: 16,
    textAlign: "center",
  },
  benefitsList: {
    alignSelf: "stretch",
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  benefitText: {
    fontSize: 16,
    color: "#1A1A2E",
    flex: 1,
  },
  privacyNote: {
    fontSize: 12,
    color: "#B8B8D1",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 18,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  declineButton: {
    flex: 1,
  },
  acceptButton: {
    flex: 1,
  },
});
