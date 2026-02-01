import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { colors } from "@/constants/colors";
import { getDocument } from "@/services/storage/documents/getDocument";
import { askDocument as askDocumentSimple } from "@/services/rag/ask";
import { askDocument as askDocumentAdvanced } from "@/services/rag/askDoc";
import { Send } from "lucide-react-native";

type MessageRole = "user" | "assistant" | "system";

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
}

export default function AskDocumentScreen() {
  const { documentId } = useLocalSearchParams<{ documentId: string }>();
  const [documentTitle, setDocumentTitle] = useState<string>("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingDoc, setIsLoadingDoc] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      if (!documentId) return;
      try {
        setIsLoadingDoc(true);
        const doc = await getDocument(documentId);
        setDocumentTitle(doc?.title ?? "Document chat");
        // Seed chat with a friendly helper message tied to the selected document.
        setMessages([
          {
            id: "intro",
            role: "assistant",
            content:
              "Hi! I'm your study buddy. Ask any question about this PDF and I'll pull the best answer from your document.",
          },
        ]);
      } catch (err) {
        setMessages([
          {
            id: "error",
            role: "assistant",
            content:
              "I couldn't load this document's info. You can still try asking questions though!",
          },
        ]);
      } finally {
        setIsLoadingDoc(false);
      }
    }

    bootstrap();
  }, [documentId]);

  const handleSend = async () => {
    if (!input.trim() || !documentId) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const question = input.trim();
    setInput("");

    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: question,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsSending(true);

    try {
      // Prefer askDoc.ts (configurable match count) but keep the simpler helper as a fallback.
      let response = await askDocumentAdvanced({
        documentId,
        question,
        matchCount: 8,
      });

      if (!response?.answer) {
        response = await askDocumentSimple(question, documentId);
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content:
          response?.answer ??
          "I couldn't find an answer in the document. Try rephrasing your question!",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content:
            (err as Error)?.message ??
            "Something went wrong asking the document. Please try again.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const isSendDisabled = useMemo(
    () => !input.trim() || isSending || !documentId,
    [input, isSending, documentId],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <Stack.Screen options={{ title: documentTitle || "Ask AI" }} />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {isLoadingDoc ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loaderText}>Loading document...</Text>
          </View>
        ) : (
          <>
            <FlatList
              data={messages}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messages}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.messageBubble,
                    item.role === "user"
                      ? styles.messageBubbleUser
                      : styles.messageBubbleAssistant,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      item.role === "user"
                        ? styles.messageTextUser
                        : styles.messageTextAssistant,
                    ]}
                  >
                    {item.content}
                  </Text>
                </View>
              )}
            />

            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Ask something about this PDF..."
                value={input}
                onChangeText={setInput}
                multiline
              />
              <Pressable
                style={[
                  styles.sendButton,
                  isSendDisabled && styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={isSendDisabled}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Send size={18} color={colors.white} />
                )}
              </Pressable>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loaderText: {
    color: colors.textSecondary,
  },
  messages: {
    gap: 12,
    paddingBottom: 24,
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    maxWidth: "85%",
  },
  messageBubbleUser: {
    backgroundColor: colors.primary,
    alignSelf: "flex-end",
  },
  messageBubbleAssistant: {
    backgroundColor: `${colors.primary}15`,
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTextUser: {
    color: colors.white,
  },
  messageTextAssistant: {
    color: colors.text,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderColor: `${colors.border}50`,
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
});
