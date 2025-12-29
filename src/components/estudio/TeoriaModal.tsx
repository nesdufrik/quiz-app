'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BookOpen } from 'lucide-react'

interface TeoriaModalProps {
	isOpen: boolean
	onClose: () => void
	titulo: string
	contenido: string | null
}

export function TeoriaModal({
	isOpen,
	onClose,
	titulo,
	contenido,
}: TeoriaModalProps) {
	if (!contenido) return null

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl w-[95vw] h-[85vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
				<DialogHeader className="p-6 pb-4 border-b bg-muted/20">
					<div className="flex items-center gap-2 text-primary mb-1">
						<BookOpen className="h-5 w-5" />
						<span className="text-xs font-bold uppercase tracking-wider">
							Material de Estudio
						</span>
					</div>
					<DialogTitle className="text-2xl font-bold leading-tight">
						{titulo}
					</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						Lee atentamente la teoría antes de comenzar tu práctica.
					</DialogDescription>
				</DialogHeader>

				<ScrollArea className="flex-1 w-full h-full bg-background">
					<div className="p-8 md:p-12 pb-64 md:pb-64">
						<div
							className="prose prose-slate dark:prose-invert max-w-none 
              prose-headings:text-foreground prose-headings:font-bold 
              prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
              prose-p:text-foreground/90 prose-p:leading-relaxed prose-p:text-lg
              prose-li:text-foreground/90 prose-li:text-lg
              prose-strong:text-foreground prose-strong:font-bold
              prose-img:rounded-xl prose-img:shadow-md
              prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-primary prose-code:before:content-none prose-code:after:content-none
              prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:px-6 prose-blockquote:py-2 prose-blockquote:rounded-r-lg"
						>
							<ReactMarkdown remarkPlugins={[remarkGfm]}>
								{contenido}
							</ReactMarkdown>
						</div>
					</div>
				</ScrollArea>

				<div className="p-4 border-t bg-muted/10 flex justify-end">
					<button
						onClick={onClose}
						className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
					>
						Cerrar Lectura
					</button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
