import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { conversationApi, userApi, recipeApi } from '../api.js';
import Icon from '../components/Icon.jsx';

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'baru saja';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} mnt`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari`;
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function clock(iso) {
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function Avatar({ user, size = 'h-11 w-11' }) {
  if (!user) return <span className={`${size} shrink-0 rounded-full bg-spice-100`} />;
  if (user.avatarUrl) {
    return <img src={user.avatarUrl} alt={user.name} className={`${size} shrink-0 rounded-full object-cover`} />;
  }
  return (
    <span className={`${size} flex shrink-0 items-center justify-center rounded-full bg-spice-600 text-sm font-bold text-white`}>
      {user.name?.charAt(0)?.toUpperCase()}
    </span>
  );
}

function RecipeCardChat({ recipeId }) {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    recipeApi
      .get(recipeId)
      .then((data) => setRecipe(data.recipe))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [recipeId]);

  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-cream-200 bg-white">
        <div className="animate-pulse">
          <div className="h-24 bg-cream-200" />
          <div className="p-3 space-y-2">
            <div className="h-3 w-3/4 rounded bg-cream-200" />
            <div className="h-3 w-1/2 rounded bg-cream-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="rounded-xl border border-cream-200 bg-white px-3 py-2 text-xs text-stone-400">
        Resep tidak ditemukan
      </div>
    );
  }

  return (
    <Link
      to={`/recipes/${recipe.id}`}
      className="block overflow-hidden rounded-xl border border-cream-200 bg-white transition hover:shadow-md"
    >
      {recipe.coverUrl && (
        <div className="h-24 w-full overflow-hidden bg-cream-200">
          <img src={recipe.coverUrl} alt={recipe.title} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="p-3">
        <p className="text-xs font-bold text-stone-900 line-clamp-2">{recipe.title}</p>
        <div className="mt-1 flex items-center gap-2 text-[10px] text-stone-400">
          <span>{recipe.category === 'DRINK' ? <Icon name="drink" className="h-3 w-3" /> : <Icon name="food" className="h-3 w-3" />}</span>
          {recipe.cookTime && <span>{recipe.cookTime} mnt</span>}
          {recipe._count?.likes > 0 && <span className="flex items-center gap-1"><Icon name="heart-filled" className="h-3 w-3 text-red-400" /> {recipe._count.likes}</span>}
        </div>
      </div>
    </Link>
  );
}

function parseRecipeId(content) {
  const match = content?.match(/\[recipe\](.+?)\[\/recipe\]/);
  return match ? match[1] : null;
}

export default function Messages() {
  const { user: me } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedUser = searchParams.get('user');

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [mutualUsers, setMutualUsers] = useState([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  const loadConversations = useCallback(async () => {
    try {
      const data = await conversationApi.list();
      setConversations(data.conversations);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (requestedUser) {
      conversationApi
        .open(requestedUser)
        .then(({ conversationId }) => {
          setActiveId(conversationId);
          setSearchParams({}, { replace: true });
          loadConversations();
        })
        .catch((err) => setError(err.message));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setInterval(loadConversations, 5000);
    return () => clearInterval(timer);
  }, [loadConversations]);

  const loadMessages = useCallback(
    async (convId) => {
      setLoadingMsg(true);
      try {
        const data = await conversationApi.messages(convId);
        setMessages(data.messages);
        const hasUnreadFromOther = data.messages.some((m) => m.senderId !== me.id && !m.isRead);
        if (hasUnreadFromOther) {
          conversationApi.markRead(convId).catch(() => {});
          loadConversations();
        }
      } catch (err) {
        if (err.status === 404) {
          setActiveId(null);
          setMessages([]);
          return;
        }
        setError(err.message);
      } finally {
        setLoadingMsg(false);
      }
    },
    [me.id, loadConversations]
  );

  useEffect(() => {
    if (!activeId) return;
    loadMessages(activeId);
    const timer = setInterval(() => loadMessages(activeId), 3000);
    return () => clearInterval(timer);
  }, [activeId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content || !activeId) return;
    const currentReplyTo = replyTo;
    setDraft('');
    setReplyTo(null);
    try {
      const { message } = await conversationApi.send(activeId, content, currentReplyTo?.id);
      setMessages((prev) => [...prev, message]);
      loadConversations();
    } catch (err) {
      if (err.status === 404) {
        setActiveId(null);
        setMessages([]);
        return;
      }
      setError(err.message);
      setDraft(content);
      setReplyTo(currentReplyTo);
    }
  };

  const openNewChat = async (userId) => {
    setShowNewChat(false);
    try {
      const { conversationId } = await conversationApi.open(userId);
      setActiveId(conversationId);
      loadConversations();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleNewChat = async () => {
    const next = !showNewChat;
    setShowNewChat(next);
    if (next && mutualUsers.length === 0) {
      try {
        const data = await userApi.mutual();
        setMutualUsers(data.users);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeId) || null;
  const otherUser = activeConversation?.otherUser || null;

  return (
    <main className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">Pesan</h1>
      <p className="mt-1 text-sm text-stone-500">
        Chat dengan teman yang sudah saling follow.
      </p>

      {error && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4 lg:h-[calc(100vh-10rem)] lg:flex-row">
        {/* Daftar percakapan */}
        <div className={`${activeId ? 'hidden lg:flex' : 'flex'} w-full shrink-0 flex-col lg:flex lg:w-80`}>
          <div className="flex items-center justify-between rounded-2xl border border-cream-200 bg-white px-4 py-3">
            <h2 className="text-base font-extrabold text-stone-900">Percakapan</h2>
            <button
              onClick={toggleNewChat}
              className="rounded-full bg-spice-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-spice-700"
            >
              + Chat Baru
            </button>
          </div>

          {showNewChat && (
            <div className="mt-2 rounded-2xl border border-cream-200 bg-white p-2">
              {mutualUsers.length === 0 ? (
                <p className="px-3 py-3 text-sm text-stone-500">
                  Belum ada teman yang saling mengikuti. Cari & saling follow dulu lewat menu Cari Teman.
                </p>
              ) : (
                mutualUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => openNewChat(u.id)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-cream-50"
                  >
                    <Avatar user={u} size="h-9 w-9" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-stone-900">{u.name}</span>
                      {u.bio && <span className="block truncate text-xs text-stone-500">{u.bio}</span>}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}

          <div className="mt-4 flex-1 space-y-2 overflow-y-auto pr-0.5">
            {loadingList && conversations.length === 0 ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-2xl border border-cream-200 bg-white p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full bg-cream-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-1/2 rounded bg-cream-200" />
                        <div className="h-3 w-3/4 rounded bg-cream-200" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-cream-300 bg-white px-5 py-10 text-center">
                <span className="text-4xl"><Icon name="chat" className="h-10 w-10 text-stone-300" /></span>
                <p className="mt-3 text-sm font-bold text-stone-900">Belum ada percakapan</p>
                <p className="mt-1 text-xs text-stone-500">
                  Klik "+ Chat Baru" untuk memulai dengan teman yang saling mengikuti.
                </p>
              </div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveId(c.id);
                    setShowNewChat(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                    c.id === activeId
                      ? 'border-spice-300 bg-spice-50'
                      : 'border-cream-200 bg-white hover:bg-cream-50'
                  }`}
                >
                  <Avatar user={c.otherUser} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-bold text-stone-900">{c.otherUser?.name}</p>
                      {c.lastMessage && <span className="shrink-0 text-[11px] text-stone-400">{timeAgo(c.updatedAt)}</span>}
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-stone-500">
                        {c.lastMessage
                          ? `${c.lastMessage.senderId === me.id ? 'Kamu: ' : ''}${c.lastMessage.content}`
                          : 'Belum ada pesan'}
                      </p>
                      {c.unreadCount > 0 && (
                        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-ember-600 px-1 text-[10px] font-bold text-white">
                          {c.unreadCount > 99 ? '99+' : c.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Jendela chat */}
        <div
          className={`${activeId ? 'flex' : 'hidden lg:flex'} min-h-[70vh] flex-1 flex-col overflow-hidden rounded-2xl border border-cream-200 bg-white lg:min-h-0`}
        >
          {otherUser ? (
            <>
              <div className="flex items-center gap-2 border-b border-cream-200 px-4 py-3">
                <button
                  onClick={() => setActiveId(null)}
                  className="rounded-lg p-1 text-stone-500 transition hover:bg-cream-100 lg:hidden"
                  aria-label="Kembali"
                >
                  ←
                </button>
                <Link to={`/u/${otherUser.id}`} className="flex items-center gap-3">
                  <Avatar user={otherUser} size="h-9 w-9" />
                  <span className="text-sm font-bold text-stone-900">{otherUser.name}</span>
                </Link>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto bg-cream-50/60 px-4 py-4">
                {loadingMsg && messages.length === 0 ? (
                  <p className="text-center text-sm text-stone-500">Memuat pesan…</p>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center py-10 text-center">
                    <span className="text-4xl"><Icon name="chat" className="h-10 w-10 text-stone-300" /></span>
                    <p className="mt-3 text-sm font-bold text-stone-900">Belum ada pesan</p>
                    <p className="mt-1 text-xs text-stone-500">Mulai sapaan pertamamu untuk {otherUser.name}!</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const mine = m.senderId === me.id;
                    const recipeId = parseRecipeId(m.content);
                    return (
                      <div key={m.id} className={`group flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div className="relative max-w-[75%]">
                          {m.replyTo && (
                            <div className="mb-1 rounded-t-2xl border-l-4 border-spice-400 bg-stone-200/70 px-3 py-2 text-xs">
                              <span className="font-bold text-stone-700">{m.replyTo.senderName}</span>
                              <p className="mt-0.5 truncate text-stone-500">{m.replyTo.content}</p>
                            </div>
                          )}
                          <div
                            className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                              m.replyTo ? 'rounded-t-none ' : ''
                            }${mine
                              ? 'rounded-br-md bg-ember-600 text-white'
                              : 'rounded-bl-md border border-cream-200 bg-white text-stone-800'
                            }`}
                          >
                            {recipeId ? (
                              <RecipeCardChat recipeId={recipeId} />
                            ) : (
                              <p className="whitespace-pre-wrap break-words">{m.content}</p>
                            )}
                            <div className={`mt-1 flex items-center justify-end gap-2 text-[10px] ${mine ? 'text-white/70' : 'text-stone-400'}`}>
                              <span>{clock(m.createdAt)}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => setReplyTo(m)}
                            className={`absolute top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full opacity-0 shadow-sm transition group-hover:opacity-100 ${
                              mine
                                ? '-left-9 bg-white text-stone-500 hover:bg-cream-100'
                                : '-right-9 bg-white text-stone-500 hover:bg-cream-100'
                            }`}
                            title="Balas"
                          >
                            <Icon name="reply" className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={handleSend} className="border-t border-cream-200">
                {replyTo && (
                  <div className="flex items-center gap-2 border-b border-cream-100 bg-cream-50 px-4 py-2">
                    <div className="min-w-0 flex-1 border-l-2 border-spice-400 pl-3">
                      <p className="text-xs font-semibold text-stone-500">Membalas {replyTo.senderId === me.id ? 'diri sendiri' : otherUser?.name}</p>
                      <p className="truncate text-xs text-stone-400">{replyTo.content}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReplyTo(null)}
                      className="shrink-0 rounded-full p-1 text-stone-400 transition hover:bg-cream-200 hover:text-stone-600"
                    >
                      <Icon name="x" className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2 p-3">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Tulis pesan…"
                    className="flex-1 rounded-full border border-cream-300 bg-cream-50 px-4 py-2.5 text-sm outline-none transition focus:border-spice-400 focus:ring-2 focus:ring-spice-200"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim()}
                    className="rounded-full bg-ember-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-ember-700 disabled:opacity-50"
                  >
                    Kirim
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <span className="text-5xl"><Icon name="chat" className="h-10 w-10 text-stone-300" /></span>
              <h2 className="mt-4 text-lg font-bold text-stone-900">Pilih percakapan</h2>
              <p className="mt-2 max-w-sm text-sm text-stone-500">
                Pilih percakapan di kiri, atau mulai chat baru dengan teman yang saling mengikuti.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
