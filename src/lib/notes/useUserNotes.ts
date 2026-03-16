"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface UserNote {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface CreateNoteInput {
  title: string;
  content: string;
}

interface UpdateNoteInput {
  title?: string;
  content?: string;
}

async function getCurrentUserId() {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) throw new Error("Usuário não autenticado.");

  return user.id;
}

export function useUserNotes() {
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const userId = await getCurrentUserId();
      const { data, error } = await supabase
        .from("notes")
        .select("id,user_id,title,content,created_at,updated_at")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setNotes((data ?? []) as UserNote[]);
    } catch (error) {
      console.error("Failed to load notes", error);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createNote = useCallback(async ({ title, content }: CreateNoteInput) => {
    const userId = await getCurrentUserId();

    const { data, error } = await supabase
      .from("notes")
      .insert({
        user_id: userId,
        title,
        content,
        updated_at: new Date().toISOString()
      })
      .select("id,user_id,title,content,created_at,updated_at")
      .single();

    if (error) throw error;

    const createdNote = data as UserNote;
    setNotes((prev) => [createdNote, ...prev]);
    return createdNote;
  }, []);

  const updateNote = useCallback(async (id: string, payload: UpdateNoteInput) => {
    const { data, error } = await supabase
      .from("notes")
      .update({
        ...payload,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select("id,user_id,title,content,created_at,updated_at")
      .single();

    if (error) throw error;

    const updated = data as UserNote;
    setNotes((prev) => prev.map((note) => (note.id === updated.id ? updated : note)));
    return updated;
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) throw error;

    setNotes((prev) => prev.filter((note) => note.id !== id));
  }, []);

  return {
    notes,
    loading,
    createNote,
    updateNote,
    deleteNote,
    refresh
  };
}
