import AnecdoteForm from './components/AnecdoteForm'
import Notification from './components/Notification'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAnecdotes, createAnecdote, updateAnecdote } from './requests'
import { useReducer } from 'react'

const notificationReducer = (state, action) => {
  switch (action.type) {
    case "CREATED":
        return `${action.payload} was created.`
    case "VOTED":
        return `${action.payload} was voted.`
    case "ERROR":
        return 'Content is too short.'
    default:
        return state
  }
}

const App = () => {
  const [notification, notificationDispatch] = useReducer(notificationReducer, null)
  const queryClient = useQueryClient()
  const newAnecdoteMutation = useMutation({ 
    mutationFn: createAnecdote,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['anecdotes'] }),
      notificationDispatch({type: 'CREATED', payload: variables.content})
    },
    onError: () => {
      notificationDispatch({type: 'ERROR'})
    }})
  
  const updateAnecdoteMutation = useMutation({
    mutationFn: updateAnecdote,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['anecdotes'] }),
      notificationDispatch({type: 'VOTED', payload: variables.content})
    },
  })
  const vote = (anecdote) => {
    updateAnecdoteMutation.mutate({...anecdote, votes: anecdote.votes += 1 })
  }

  const handleVote = (anecdote) => {
    console.log('vote')
  }

  const result = useQuery({
    queryKey: ['anecdotes'],
    queryFn: getAnecdotes,
    retry: 1
  })
  console.log(JSON.parse(JSON.stringify(result)))

  if ( result.isLoading ) {
    return <div>loading data...</div>
  }

  const anecdotes = result.data

  const addAnecdote = async (event) => {
    event.preventDefault()
    const content = event.target.anecdote.value
    event.target.anecdote.value = ''
    newAnecdoteMutation.mutate({ content, votes: 0 })
  }


  return (
    <div>
      <h3>Anecdote app</h3>
    
      <Notification text={notification}/>
      <AnecdoteForm fn={addAnecdote}/>
    
      {anecdotes.map(anecdote =>
        <div key={anecdote.id}>
          <div>
            {anecdote.content}
          </div>
          <div>
            has {anecdote.votes}
            <button onClick={() => vote(anecdote)}>vote</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
