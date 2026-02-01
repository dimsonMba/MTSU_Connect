import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { colors } from "@/constants/colors";
import { ChatBubble } from "@/components/ChatBubble";
import { Message } from "@/types";
import { mockChatRooms } from "@/mocks/data";
import { Send, Paperclip, Users } from "lucide-react-native";
import * as Haptics from "expo-haptics";

const mockMessages: Message[] = [
  {
    id: "1",
    senderId: "2",
    senderName: "Alex Chen",
    content: "Hey everyone! Anyone working on the BST problem from class?",
    timestamp: new Date(Date.now() - 3600000),
    isOwn: false,
  },
  {
    id: "2",
    senderId: "1",
    senderName: "You",
    content:
      "Yeah, I'm stuck on the deletion part. The recursive approach is confusing me.",
    timestamp: new Date(Date.now() - 3500000),
    isOwn: true,
  },
  {
    id: "3",
    senderId: "3",
    senderName: "Sarah Johnson",
    content:
      "I found a great explanation! The key is understanding the three cases: leaf node, one child, and two children.",
    timestamp: new Date(Date.now() - 3400000),
    isOwn: false,
  },
  {
    id: "4",
    senderId: "2",
    senderName: "Alex Chen",
    content: "Can you share the link?",
    timestamp: new Date(Date.now() - 3300000),
    isOwn: false,
  },
  {
    id: "5",
    senderId: "3",
    senderName: "Sarah Johnson",
    content:
      "Sure! I'll upload it to our shared folder. Also, does anyone want to meet at the library later to work through it together?",
    timestamp: new Date(Date.now() - 3200000),
    isOwn: false,
  },
  {
    id: "6",
    senderId: "1",
    senderName: "You",
    content: "That would be great! What time works for you?",
    timestamp: new Date(Date.now() - 3100000),
    isOwn: true,
  },
];

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const chatRoom = mockChatRooms.find((r) => r.id === chatId);

  const handleSend = () => {
    if (!inputText.trim()) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: "1",
      senderName: "You",
      content: inputText.trim(),
      timestamp: new Date(),
      isOwn: true,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <Stack.Screen
        options={{
          title: chatRoom?.name || "Chat",
          headerRight: () => (
            <View style={styles.headerRight}>
              <View style={styles.participantsBadge}>
                <Users size={14} color={colors.primary} />
                <Text style={styles.participantsText}>
                  {chatRoom?.participants || 0}
                </Text>
              </View>
            </View>
          ),
        }}
      />

      {chatRoom?.isStudyRoom && (
        <View style={styles.roomBanner}>
          <Text style={styles.roomBannerText}>
            📚 Study Room • {chatRoom.subject}
          </Text>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatBubble message={item} />}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
      />

      <View style={styles.inputContainer}>
        <Pressable style={styles.attachButton}>
          <Paperclip size={22} color={colors.textSecondary} />
        </Pressable>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={1000}
        />
        <Pressable
          style={[
            styles.sendButton,
            !inputText.trim() && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Send
            size={20}
            color={inputText.trim() ? colors.white : colors.textMuted}
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  participantsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.primary}10`,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  participantsText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: colors.primary,
  },
  roomBanner: {
    backgroundColor: `${colors.primary}10`,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  roomBannerText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: colors.primary,
    textAlign: "center",
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 10,
  },
  attachButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: colors.background,
  },
});
